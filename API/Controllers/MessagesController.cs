
using API.Controllers;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

public class MessagesController(IMessageRepository messageRepository, IMemberRepository memberRepository) : BaseController
{
   [HttpPost]
   public async Task<ActionResult<MessagesDTO>> CreateMessage(CreateMessageDTO createMessageDTO)
    {
        //Get Details of logged in user
        var sender = await  memberRepository.GetMemberByIdAsyc(User.GetMemberId());
        //Get details of message receiver
        var receipent = await memberRepository.GetMemberByIdAsyc(createMessageDTO.RecipientId);

        if(sender == null || receipent == null || createMessageDTO.RecipientId == sender.Id)
        {
            return BadRequest("Can not send this message");
        }

        var message = new Messages
        {
            SenderId = sender.Id,
            RecipientId = receipent.Id,
            Content = createMessageDTO.Content
        };

        messageRepository.AddMessage(message);

        if(await messageRepository.SaveAllAsync())
        {
            return message.AsMessageDTO();
        }
        else
        {
            return BadRequest("Message can not be sent");
        }
    }

}