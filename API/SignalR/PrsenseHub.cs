using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

    [Authorize]
    public class PresenceHub : Hub
    {
    public override async Task OnConnectedAsync() //Things we want to do when user connects to hub goes here
    {
       await Clients.Others.SendAsync("UserOnline", Context.User?.FindFirstValue(ClaimTypes.Email));
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.Others.SendAsync("UserOffline", Context.User?.FindFirstValue(ClaimTypes.Email));

        await base.OnDisconnectedAsync(exception);
    }
    }
