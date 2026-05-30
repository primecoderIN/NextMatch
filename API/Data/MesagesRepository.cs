using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;


public class MessagesRepository(AppDBContext context) : IMessageRepository
{
    public void AddMessage(Messages message)
    {
       context.Messages.AddAsync(message);
    }

    public void DeleteMessage(Messages message)
    {
       context.Messages.Remove(message);
    }

    public async Task<Messages?> GetMessage(int messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<PaginatedResult<MessagesDTO>> GetMessagesForMember()
    {
        throw new NotImplementedException();
    }

    public async Task<IReadOnlyList<MessagesDTO>> GetMessageThread(string currentMemberId, string recipientMemberId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> SaveAllAsync()
    {
      return await context.SaveChangesAsync() > 0;
    }
}