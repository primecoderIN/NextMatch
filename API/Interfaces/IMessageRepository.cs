using API.Entities;
using API.Helpers;
using API.DTOs;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Messages message);
        void DeleteMessage(Messages message);

        Task<Messages?> GetMessage(int messageId);
        Task<PaginatedResult<MessagesDTO>> GetMessagesForMember();

        Task<IReadOnlyList<MessagesDTO>> GetMessageThread(string currentMemberId, string recipientMemberId);

        Task<bool> SaveAllAsync();
    }
}