using API.DTOs;
using API.Entities;

public static class MesagesExtension
{
    public static MessagesDTO AsMessageDTO(this Messages message)
    {
        return new MessagesDTO
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderUsername = message.Sender.UserName,
            SenderImageUrl = message.Sender.ImageUrl,
            RecipientId = message.RecipientId,
            RecipientUsername = message.Recipient.UserName,
            RecipientImageUrl = message.Recipient.ImageUrl,
            Content = message.Content,
            DateRead = message.DateRead,
            MessageSent = message.MessageSent
        };
    }
}