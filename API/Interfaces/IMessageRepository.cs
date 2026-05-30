using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Messages message);
        void DeleteMessage(Messages message);

        Task<Messages> GetMessage(int id);
        Task<PaginatedResult<Messages>> GetMessagesForMember();

        Task<IReadOnlyList<Messages>> GetMessageThread(string currentMemberId, string recipientMemberId);

        Task<bool> SaveAllAsync();
    }
}