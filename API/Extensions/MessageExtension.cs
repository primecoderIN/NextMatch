using System.Linq.Expressions;
using API.DTOs;
using API.Entities;

public static class MessageExtension
{
    public static MessageDTO AsMessageDTO(this Message message) //In memory projection for already loaded data
    {
        return new MessageDTO
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

    public static Expression<Func<Message, MessageDTO>> ToDTOProjection(){ //Direct database projection
        return message => new MessageDTO
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
