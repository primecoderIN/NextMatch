
using API.Controllers;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

public class MessagesController(IMessageRepository messageRepository, IMemberRepository memberRepository) : BaseController
{
   [HttpPost]
   public async Task<ActionResult<MessageDTO>> CreateMessage(CreateMessageDTO createMessageDTO)
    {
        //Get Details of logged in user
        var sender = await  memberRepository.GetMemberByIdAsyc(User.GetMemberId());
        //Get details of message receiver
        var receipent = await memberRepository.GetMemberByIdAsyc(createMessageDTO.RecipientId);

        if(sender == null || receipent == null || createMessageDTO.RecipientId == sender.Id)
        {
            return BadRequest("Can not send this message");
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
            return message.AsMessageDTO();
        }
        else
        {
            return BadRequest("Message can not be sent");
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDTO>>> GetMessagesByContainer ([FromQuery] MessageParams messageParams)
    {
        messageParams.MemberId = User.GetMemberId();
        return await messageRepository.GetMessagesForMember(messageParams);
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDTO>>> GetMessageThread(string recipientId)
    {
        var currentMemberId = User.GetMemberId();
        return Ok(await messageRepository.GetMessageThread(currentMemberId, recipientId));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var currentMemberId = User.GetMemberId();

        var currentMessage =await messageRepository.GetMessageById(id);

        if(currentMessage==null)
        {
            return NotFound();
        }

        if(currentMemberId!= currentMessage.SenderId && currentMemberId != currentMessage.RecipientId)
        {
            return Unauthorized();
        }

        if(currentMemberId==currentMessage.SenderId)
        {
            currentMessage.SenderDeleted=true;
        } 

        if(currentMemberId==currentMessage.RecipientId)  
        {
            currentMessage.RecipientDeleted=true;
        }

        if(currentMessage is {SenderDeleted:true, RecipientDeleted:true})
        {
            messageRepository.DeleteMessage(currentMessage);
        }

        if(await memberRepository.SaveAllAsync())
        {
            return Ok();
        }

        return BadRequest("Problem deleting the message");
       

    }



}
