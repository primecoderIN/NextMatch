using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;


public class MessageRepository(AppDBContext context) : IMessageRepository
{
    public void AddMessage(Message message)
    {
       context.Messages.AddAsync(message);
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

         query= messageParams.Containter switch
         {
             "Outbox" => query.Where(x=> x.SenderId==messageParams.MemberId),
             _ => query.Where(x=> x.RecipientId==messageParams.MemberId)
         };

         var messageQuery = query.Select(MessageExtension.ToDTOProjection());

         return await PaginationHelper<MessageDTO>.CreateAsync(messageQuery, messageParams.PageNumber, messageParams.PageSize);
         
    }

    public async Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string recipientMemberId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> SaveAllAsync()
    {
      return await context.SaveChangesAsync() > 0;
    }
}
