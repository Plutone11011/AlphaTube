
function setComments(id){
    $.get(
        'https://www.googleapis.com/youtube/v3/commentThreads',
        {
            part: 'snippet, replies',
            key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
            videoId: id,
            textFormat: 'plainText'
        },
        function(data){
            //topLevelComment: comment resource
            //snippet.authorDisplayName: autore del commento
            //snippet.textDisplay: testo del commento
            var commenti = '' ;
            $.each(data.items, (index,value)=>{
                commenti += '<p><span class="autori">' + value.snippet.topLevelComment.snippet.authorDisplayName + '</span>: ' + 
                value.snippet.topLevelComment.snippet.textDisplay + '</p>';
            })
            $('#commenti').html(commenti);
            $('.autori').css("font-weight", "bold");
            $('#commenti > p').css("overflow-break", "break-word");

        }	
    );
}

function setContent(){
    var url = "http://dbpedia.org/snorql";
    var query = [
        "SELECT ?title", 
        "WHERE {",
            "?game a dbo:Game.",
            "?game foaf:name ?title.",
        "}",
        "ORDER by ?title"].join(" ");
    var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
    $.ajax({
        dataType: "json",
        url: queryUrl,
        success: function(_data){
            console.log(_data.results);
        }
    });
}
