using API.Entities;
using API.Helpers;
using API.DTOs;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Message message);
        void DeleteMessage(Message message);

        Task<Message?> GetMessageById(string messageId);
        Task<PaginatedResult<MessageDTO>> GetMessagesForMember(MessageParams messageParams);

        Task<IReadOnlyList<MessageDTO>> GetMessageThread(string currentMemberId, string recipientMemberId);

        /// <summary>
        /// Returns a page of messages (newest first, then reversed for display) and a hasMore flag.
        /// Marks unread messages as read only on pageNumber == 1.
        /// </summary>
        Task<(IReadOnlyList<MessageDTO> Messages, bool HasMore)> GetMessageThreadPaged(
            string currentMemberId, string otherMemberId, int pageNumber, int pageSize);

        Task<bool> SaveAllAsync();
    }
}
