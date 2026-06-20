using System.Collections.Concurrent;

namespace API.SignalR;

/// <summary>
/// Tracks online users and their SignalR connections.
///
/// Why ConcurrentDictionary?
/// - Multiple SignalR requests can execute simultaneously.
/// - Provides thread-safe add/remove/read operations.
///
/// Why store multiple connection IDs per user?
/// - A user can be connected from multiple browser tabs, devices,
///   or applications at the same time.
///
/// Why lock?
/// - ConcurrentDictionary makes individual operations thread-safe,
///   but sequences of operations are not atomic.
/// - We must ensure:
///     Add Connection -> Check Count
///     Remove Connection -> Check Empty
///   happen as a single unit to avoid race conditions.
/// </summary>
public class PresenceTracker
{
    /// <summary>
    /// Key   = UserId
    /// Value = Collection of active connection IDs for that user
    /// </summary>
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>>
        OnlineUsers = new();

    /// <summary>
    /// Registers a new SignalR connection.
    ///
    /// Returns:
    /// true  = User has just come online (first active connection)
    /// false = User was already online
    /// </summary>
    public Task<bool> UserConnected(string userId, string connectionId)
    {
        bool isOnline = false;

        var connections = OnlineUsers.GetOrAdd(
            userId,
            _ => new ConcurrentDictionary<string, byte>()
        );

        lock (connections)
        {
            connections.TryAdd(connectionId, 0);

            // First connection for this user.
            if (connections.Count == 1)
            {
                isOnline = true;
            }
        }

        return Task.FromResult(isOnline);
    }

    /// <summary>
    /// Removes a SignalR connection.
    ///
    /// Returns:
    /// true  = User has gone completely offline (last connection removed)
    /// false = User still has active connections
    /// </summary>
    public Task<bool> UserDisconnected(string userId, string connectionId)
    {
        bool isOffline = false;

        if (OnlineUsers.TryGetValue(userId, out var connections))
        {
            lock (connections)
            {
                connections.TryRemove(connectionId, out _);

                // Last connection removed.
                if (connections.IsEmpty)
                {
                    OnlineUsers.TryRemove(userId, out _);
                    isOffline = true;
                }
            }
        }

        return Task.FromResult(isOffline);
    }

    /// <summary>
    /// Returns all currently online users sorted alphabetically.
    ///
    /// Task.FromResult is used because no asynchronous work is performed.
    /// This avoids creating an unnecessary async state machine.
    /// </summary>
    public Task<string[]> GetOnlineUsers()
    {
        return Task.FromResult(
            OnlineUsers.Keys
                .OrderBy(userId => userId)
                .ToArray()
        );
    }
}