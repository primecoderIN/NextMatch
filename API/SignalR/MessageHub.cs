using API.DTOs;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using API.Entities;

namespace API.SignalR;

[Authorize]
public class MessageHub(IMessageRepository messageRepository, IMemberRepository memberRepository) : Hub
{
    private const int PageSize = 10;

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();

        var otherUserId = httpContext?.Request.Query["userId"].ToString()
            ?? throw new HubException("Other user not found");

        var groupName = GetGroupName(GetUserId(), otherUserId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        // Send first page only (most recent messages); also marks unread messages as read
        var (messages, hasMore, newlyReadIds) = await messageRepository.GetMessageThreadPaged(GetUserId(), otherUserId, 1, PageSize);
        await Clients.Caller.SendAsync("ReceiveMessageThread", messages, hasMore);

        // If any messages were just marked as read, notify the sender so they can show read receipts
        if (newlyReadIds.Count > 0)
        {
            await Clients.OthersInGroup(groupName).SendAsync("MessagesRead", newlyReadIds);
        }
    }

    /// <summary>Called by the client when user scrolls to top to load older messages.</summary>
    public async Task LoadMoreMessages(string otherUserId, int pageNumber)
    {
        var (messages, hasMore, _) = await messageRepository.GetMessageThreadPaged(
            GetUserId(), otherUserId, pageNumber, PageSize);

        await Clients.Caller.SendAsync("ReceiveMoreMessages", messages, hasMore);
    }

    public async Task SendMessage(CreateMessageDTO createMessageDTO)
    {
        var sender = await memberRepository.GetMemberByIdAsyc(GetUserId());
        var receipent = await memberRepository.GetMemberByIdAsyc(createMessageDTO.RecipientId);

        if (sender == null || receipent == null || createMessageDTO.RecipientId == sender.Id)
        {
            throw new HubException("Can not send message");
        }

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = receipent.Id,
            Content = createMessageDTO.Content,
            Sender = sender,
            Recipient = receipent
        };

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync())
        {
            var group = GetGroupName(sender.Id, receipent.Id);
            await Clients.Group(group).SendAsync("NewMessage", message.AsMessageDTO());
        }
        else
        {
            throw new HubException("Message can not be sent");
        }
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        return base.OnDisconnectedAsync(exception);
    }

    private static string GetGroupName(string? caller, string? otherUserId)
    {
        var stringCompare = string.CompareOrdinal(caller, otherUserId) < 0;
        return stringCompare ? $"{caller}-{otherUserId}" : $"{otherUserId}-{caller}";
    }

    private string GetUserId()
    {
        return Context.User?.GetMemberId() ?? throw new HubException("Can not find the user");
    }
}