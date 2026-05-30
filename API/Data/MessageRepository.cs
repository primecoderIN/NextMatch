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

    public async Task<PaginatedResult<MessageDTO>> GetMessagesForMember()
    {
        throw new NotImplementedException();
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
