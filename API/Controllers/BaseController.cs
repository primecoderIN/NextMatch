using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))] //To update user last active time
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController : ControllerBase
    {
    }
}

//What abstract here means 

// The class cannot be instantiated

// It cannot be used as an API endpoint

// It can only be inherited