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

    public async Task<Message?> GetMessageById(string messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<PaginatedResult<MessageDTO>> GetMessagesForMember(MessageParams messageParams)
    {
         var memberId = messageParams.MemberId
            ?? throw new ArgumentException("MemberId is required", nameof(messageParams));
         var container = messageParams.Container.ToLowerInvariant();

         var query = context.Messages.AsQueryable();
         
         query = container switch
         {
             "outbox" => query.Where(x => x.SenderId == memberId && !x.SenderDeleted),
             _ => query.Where(x => x.RecipientId == memberId && !x.RecipientDeleted)
         };

         var messages = await query
            .OrderByDescending(x => x.MessageSent)
            .Select(MessageExtension.ToDTOProjection())
            .ToListAsync();

         var groupedMessages = container == "outbox"
            ? messages.GroupBy(x => x.RecipientId).Select(x => x.First()).ToList()
            : messages.GroupBy(x => x.SenderId).Select(x => x.First()).ToList();

         var count = groupedMessages.Count;
         var items = groupedMessages
            .Skip((messageParams.PageNumber - 1) * messageParams.PageSize)
            .Take(messageParams.PageSize)
            .ToList();

         return new PaginatedResult<MessageDTO>
         {
            MetaData = new PaginationMetaData
            {
               CurrentPage = messageParams.PageNumber,
               TotalPages = (int)Math.Ceiling(count / (double)messageParams.PageSize),
               PageSize = messageParams.PageSize,
               TotalCount = count
            },
            Items = items
         };
         
    }

    public async Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string senderMemberId)
    {
        await context.Messages.Where(x=> x.RecipientId==currentMemberId && x.SenderId==senderMemberId && x.DateRead==null)
        .ExecuteUpdateAsync(x=> x.SetProperty(m=> m.DateRead, DateTime.UtcNow));

        return await context.Messages.Where(x=> (x.RecipientId==currentMemberId && x.SenderId==senderMemberId && x.RecipientDeleted==false) || (x.SenderId==currentMemberId && x.RecipientId ==senderMemberId && x.SenderDeleted==false))
        .OrderBy(x=> x.MessageSent)
        .Select(MessageExtension.ToDTOProjection())
        .ToListAsync();
    }

    public async Task<(IReadOnlyList<MessageDTO> Messages, bool HasMore, IReadOnlyList<string> NewlyReadIds)> GetMessageThreadPaged(
        string currentMemberId, string otherMemberId, int pageNumber, int pageSize)
    {
        var newlyReadIds = new List<string>();

        // Mark unread messages as read on first page load only
        if (pageNumber == 1)
        {
            var unreadMessages = await context.Messages
                .Where(x => x.RecipientId == currentMemberId && x.SenderId == otherMemberId && x.DateRead == null)
                .ToListAsync();

            if (unreadMessages.Count > 0)
            {
                var readAt = DateTime.UtcNow;
                foreach (var msg in unreadMessages)
                {
                    msg.DateRead = readAt;
                    newlyReadIds.Add(msg.Id);
                }
                await context.SaveChangesAsync();
            }
        }

        var query = context.Messages
            .Where(x =>
                (x.RecipientId == currentMemberId && x.SenderId == otherMemberId && !x.RecipientDeleted) ||
                (x.SenderId == currentMemberId && x.RecipientId == otherMemberId && !x.SenderDeleted))
            .OrderByDescending(x => x.MessageSent); // newest first for pagination

        var totalCount = await query.CountAsync();
        var hasMore = totalCount > pageNumber * pageSize;

        var messages = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(MessageExtension.ToDTOProjection())
            .ToListAsync();

        // Reverse so oldest of this page appears at top (chronological order)
        messages.Reverse();

        return (messages, hasMore, newlyReadIds);
    }

    public async Task<bool> SaveAllAsync()
    {
      return await context.SaveChangesAsync() > 0;
    }

    public async Task<int> GetUnreadMessageCount(string memberId)
    {
        return await context.Messages
            .Where(x => x.RecipientId == memberId && x.DateRead == null && !x.RecipientDeleted)
            .Select(x => x.SenderId)
            .Distinct()
            .CountAsync();
    }
}
