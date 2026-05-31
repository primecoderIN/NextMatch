using API.Entities;
using API.Helpers;
using API.DTOs;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Message message);
        void DeleteMessage(Message message);

        Task<Message?> GetMessage(int messageId);
        Task<PaginatedResult<MessageDTO>> GetMessagesForMember(MessageParams messageParams);

        Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string recipientMemberId);

        Task<bool> SaveAllAsync();
    }
}
