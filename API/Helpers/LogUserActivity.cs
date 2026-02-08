
using API.Data;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        //This will update last active property in db when user performs any action 
        var resultContext = await next();

        if (context.HttpContext.User.Identity?.IsAuthenticated != true) return; //Do not update if user is not logged in

        //Get the member id 

        var memberId = resultContext.HttpContext.User.GetMemberId();

        var dbContext = resultContext.HttpContext.RequestServices.GetRequiredService<AppDBContext>(); //We can not inject db context here so taking db context like this

        await dbContext.Members.Where(x => x.Id == memberId).ExecuteUpdateAsync(setter => setter.SetProperty(x => x.LastActive, DateTime.UtcNow));

    }
}
