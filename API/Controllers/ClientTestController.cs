using Microsoft.AspNetCore.Mvc;
namespace API.Controllers
{
    public class ClientTestController : BaseController
    {
        [HttpGet("unauthorized")]
        public IActionResult GetAuthTest()
        {
            return Unauthorized();
        }

        [HttpGet("not-found")]
        public IActionResult NotFoundTest()
        {
            return NotFound();
        }

        [HttpGet("server-error")]
        public IActionResult GetServerError()
        {
            throw new Exception("This is a server error");
        }
        
        [HttpGet("bad-request")]
        public IActionResult GetBadRequest()
        {
            return BadRequest();
        }
}
}