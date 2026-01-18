using API.Data;
using Microsoft.EntityFrameworkCore;
using API.Services;
using API.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var TokenKey = builder.Configuration["TokenKey"] ?? throw new Exception("TokenKey not found for jwt configuration");
        var key = System.Text.Encoding.UTF8.GetBytes(TokenKey);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };

    });

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


builder.Services.AddScoped<ITokenService, TokenService>();



builder.Services.AddControllers();


var app = builder.Build();

//Add middlewares 



app.UseRouting();

app.UseAuthentication(); //Who are you
app.UseAuthorization(); //What are you allowed to do

app.MapControllers();

app.Run();
