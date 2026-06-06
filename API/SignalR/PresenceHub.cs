using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

    [Authorize]
    public class PresenceHub(PresenceTracker presenceTracker) : Hub
    {
    public override async Task OnConnectedAsync() //Things we want to do when user connects to hub goes here
    {
        //Add the connected user to in memory thread safe dictionary
       await presenceTracker.UserConnected(GetUserId(), Context.ConnectionId);

       //Inform others that a new user is connected
       await Clients.Others.SendAsync("UserOnline", GetUserId());

       var currentOnlineUsers = await presenceTracker.GetOnlineUsers();
       //Sent list of all online users to all the connected users 
       await Clients.Caller.SendAsync("GetAllOnlineUsers",currentOnlineUsers);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        //Remove the disconnected user from in memory thread safe dictionary
        await presenceTracker.UserDisconnected(GetUserId(), Context.ConnectionId);
        //Send user id of disconnected user to all other users
        await Clients.Others.SendAsync("UserOffline", GetUserId());

        await base.OnDisconnectedAsync(exception);
    }

    private string GetUserId()
    {
        return Context.User?.GetMemberId() ?? throw new HubException("Can not find the user");
    }
    }
