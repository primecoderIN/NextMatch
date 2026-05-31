using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;


public class MessageRepository(AppDBContext context) : IMessageRepository
{
    public void AddMessage(Message message)
    {
       context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
       context.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(int messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<PaginatedResult<MessageDTO>> GetMessagesForMember(MessageParams messageParams)
    {
         var query = context.Messages.OrderByDescending(x=> x.MessageSent).AsQueryable(); //get the last message first 

         query = messageParams.Container.ToLowerInvariant() switch
         {
             "outbox" => query.Where(x=> x.SenderId==messageParams.MemberId),
             _ => query.Where(x=> x.RecipientId==messageParams.MemberId)
         };

         var messageQuery = query.Select(MessageExtension.ToDTOProjection());

         return await PaginationHelper<MessageDTO>.CreateAsync(messageQuery, messageParams.PageNumber, messageParams.PageSize);
         
    }

    public async Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string senderMemberId)
    {
        await context.Messages.Where(x=> x.RecipientId==currentMemberId && x.SenderId==senderMemberId && x.DateRead==null)
        .ExecuteUpdateAsync(x=> x.SetProperty(m=> m.DateRead, DateTime.UtcNow));

        return await context.Messages.Where(x=> (x.RecipientId==currentMemberId && x.SenderId==senderMemberId) || (x.SenderId==currentMemberId && x.RecipientId ==senderMemberId))
        .OrderByDescending(x=> x.MessageSent)
        .Select(MessageExtension.ToDTOProjection())
        .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
      return await context.SaveChangesAsync() > 0;
    }
}
