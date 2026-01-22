using API.Data;
using API.Interfaces;
using API.Services;
using API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

/* =======================
   CORS
   ======================= */
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowCredentials();
    });
});

/* =======================
   Authentication (JWT)
   ======================= */
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var tokenKey = builder.Configuration["TokenKey"]
            ?? throw new Exception("TokenKey not found in configuration");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(tokenKey)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

/* =======================
   Authorization
   ======================= */
builder.Services.AddAuthorization();

/* =======================
   Routing
   ======================= */
builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

/* =======================
   Database
   ======================= */
builder.Services.AddDbContext<AppDBContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

/* =======================
   Application Services
   ======================= */
builder.Services.AddScoped<ITokenService, TokenService>();

/* =======================
   Controllers
   ======================= */
builder.Services.AddControllers();

var app = builder.Build();

/* =======================
   Middleware Pipeline
   ======================= */

   app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication(); // Who are you
app.UseAuthorization();  // What are you allowed to do

app.MapControllers();

app.Run();
