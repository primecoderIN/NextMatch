

namespace API.Helpers;

public class LikeParams : PaginationParams //Inherit pagination params and add additional member params for filter
{

    public string MemberId { get; set; } ="";

    public string Predicate { get; set; } = "liked";


}
