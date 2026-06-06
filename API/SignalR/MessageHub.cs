using API.Data;
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
    public override async Task OnConnectedAsync()
    {
        //We need user id of other user so we will access http context
        var httpContext = Context.GetHttpContext(); //We got http context from hub context

        //Get other user id from the query parameter 
        var otherUserId = httpContext?.Request.Query["userId"].ToString() ?? throw new HubException("Other user not found");

        //Message between two people should be private so we will use group
        //When user disconnects the user automatically get's removed form the group

        var groupName = GetGroupName(GetUserId(), otherUserId);

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        //Now get the messages and notify all users of group

        var messages = await messageRepository.GetMessageThread(GetUserId(), otherUserId);

        await Clients.Group(groupName).SendAsync("ReceiveMessageThread",messages);

 

    }

    public async Task SendMessage(CreateMessageDTO createMessageDTO)
    {
        // Note : SignalR allows a dotnet function to be called from client
                //Get Details of logged in user
        var sender = await  memberRepository.GetMemberByIdAsyc(GetUserId());
        //Get details of message receiver
        var receipent = await memberRepository.GetMemberByIdAsyc(createMessageDTO.RecipientId);

        if(sender == null || receipent == null || createMessageDTO.RecipientId == sender.Id)
        {
           throw new HubException("Can not send message");
        }

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = receipent.Id,
            Content = createMessageDTO.Content,
            Sender = sender, //Manually assigning sender and recipient to avoid null reference error when converting to DTO
            Recipient = receipent
        };

        messageRepository.AddMessage(message);

        if(await messageRepository.SaveAllAsync())
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
        //Group name should be unique so first sort alphabatically then return
        var stringCompare = string.CompareOrdinal(caller,otherUserId)<0;
        return stringCompare? $"{caller}-{otherUserId}" : $"{otherUserId}-{caller}";
    } 

    
    private string GetUserId()
    {
        return Context.User?.GetMemberId() ?? throw new HubException("Can not find the user");
    }
}