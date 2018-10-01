//description is data.items[0].snippet.description
function setDescription(description){
    $("#descrizione").html('<p>' + description + '</p>');
}

//id is data.items[0].id.videoId
function setComments(id){
    $.get(
        'https://www.googleapis.com/youtube/v3/commentThreads',
        {
            part: 'snippet, replies',
            key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
            videoId: id,
            textFormat: 'plainText'
        }).done(function(data){
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

        });
}

function setContentBrano(videoId){
    $.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
            part:'snippet, topicDetails',
            maxResults: 1,
            key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
            id: videoId
        }
        ).done((data)=>{
            var obj = { titolo: data.items[0].snippet.title } ;
            $.ajax({
                url: 'http://localhost:3000',
                data: obj,
                dataType: 'json',
                success: (data)=>{
                    $("#wikipedia").html('<p>' + data.abstract + '</p>');
                },
                error: (data)=>{
                    console.log(data);
                }
            });  
        });
}

