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
        /// Returns a page of messages (newest first, then reversed for display), a hasMore flag,
        /// and the IDs of messages that were just marked as read (only populated on pageNumber == 1).
        /// </summary>
        Task<(IReadOnlyList<MessageDTO> Messages, bool HasMore, IReadOnlyList<string> NewlyReadIds)> GetMessageThreadPaged(
            string currentMemberId, string otherMemberId, int pageNumber, int pageSize);

        /// <summary>
        /// Returns the number of distinct senders with unread messages for the given member.
        /// </summary>
        Task<int> GetUnreadMessageCount(string memberId);

        /// <summary>
        /// Marks the given message IDs as read (only if recipient matches) and returns the IDs that were updated.
        /// </summary>
        Task<IReadOnlyList<string>> MarkMessagesAsReadAsync(IEnumerable<string> messageIds, string recipientId);

        Task<bool> SaveAllAsync();
    }
}
