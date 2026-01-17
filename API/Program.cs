using API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

// Add services to the container.
builder.Services.AddDbContext<AppDBContext>(opt =>
{
    //opt is same options which we injected in AppDBContext
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});




builder.Services.AddControllers();


var app = builder.Build();

//Add middlewares 



app.UseRouting();

app.MapControllers();

app.Run();
