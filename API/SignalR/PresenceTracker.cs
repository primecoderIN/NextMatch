using System.Collections.Concurrent;

namespace API.SignalR;

public class PresenceTracker
{
    //  thread-safe in-memory data structure that can be safely accessed by multiple requests/threads simultaneously
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string,byte>> OnlineUsers = new();

    public Task UserConnected(string userId, string connectionId)
    {
        var connections = OnlineUsers.GetOrAdd(userId, _=> new ConcurrentDictionary<string, byte>());
        connections.TryAdd(connectionId,0);
        return Task.CompletedTask;
    }

    public Task UserDisconnected(string userId,string connectionId)
    {
        //if userId exists in onlineUsers dictionary then store that in connections to use
        if(OnlineUsers.TryGetValue(userId, out var connections))
        {
            connections.TryRemove(connectionId, out _);

            if(connections.IsEmpty)
            {
                OnlineUsers.TryRemove(userId, out _);
            }
        }
        return Task.CompletedTask;
    }

    public Task<string[]> GetOnlineUsers()
    {
        // This is useful when the caller expects an asynchronous method.
        // no actual asynchronous work happening here
        return Task.FromResult(OnlineUsers.Keys.OrderBy(k=>k).ToArray());
    }
    
}


// Notes : Task.FromResult(...)

// avoids the overhead of:

// public async Task<string[]> GetOnlineUsers()
// {
//     return OnlineUsers.Keys.OrderBy(k => k).ToArray();
// }

// which would generate an unnecessary async state machine.