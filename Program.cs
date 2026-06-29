var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var wwwPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwrot");
app.UseDefaultFiles(new DefaultFilesOptions 
{ 
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwPath)
});
app.UseStaticFiles(new StaticFileOptions 
{ 
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwPath)
});

var jediScore = 0;
var sithScore = 0;

app.MapGet("/api/scores", GetScores);
app.MapPost("/api/scores/{faction}", AddPoint);

app.Run();

IResult GetScores()
{
    return Results.Ok(new { jedi = jediScore, sith = sithScore });
}

IResult AddPoint(string faction)
{
    if (faction == "jedi")
    {
        jediScore++;
    }
    else if (faction == "sith")
    {
        sithScore++;
    }
    else 
    {
        return Results.BadRequest("faction חייב להיות jedi או sith");//לא אמורים להגיע לזה אבל עדיין אמורים לעשות את זה אז עשיתי
    }

    return Results.Ok(new { jedi = jediScore, sith = sithScore });
}