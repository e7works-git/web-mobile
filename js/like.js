// 좋아요 가져오기
function getLike() {
    
    const url = `${Util.Config.hostpath}/openapi/getLike`;
    let param = {
        "room_id": channel.roomId
    };
     
    $.post(url, param, function(data) {
        if (data.result_cd == 1) {
            let cnt = formatBytes(data.like_cnt, 1)
            // let cnt = formatBytes(145436, 1)
            $('#likeCounter').html(cnt);
        } else {
            console.log("조회 실패")
        }
    }, "json");

}

let like_interval;

// 좋아요 동기화
function likeInif() {
    
    // 좋아요를 초기 1회 가져온다
    getLike();
    // 5분마다 좋아요 수를 가져온다
    like_interval = setInterval(getLike, 5 * 60 * 1000);

    // 좋아요 버튼 누르면 카운트 +1
    $('#sendLike').click(function(e) {

        var option = {
            parent: $(".mobile"),
            radius: { 10: 40 },
            count: 15,
            angle: { 0: 30 },
            children: {
                // delay: 250,
                duration: 1580,
                radius: { 10: 0 },
                fill: ['#ff2d2d'],
                easing: mojs.easing.bezier(.08, .69, .39, .97)
            }
        }
        var burst = new mojs.Burst(option);
        burst.el.style.zIndex = 202

        const url = `${Util.Config.hostpath}/openapi/like`;
        let param = {
            "room_id": channel.roomId,
            "log_cnt": 1
        };
        // 통신결과 성공하면 데이터 가져오기, 실패하면 조회실패
        $.post(url, param, function(data) {
            if (data.result_cd == 1) {
                if ($('.chat .gather-file-wrap').is(':visible')) {
                    burst.generate().tune({x:142, y:-287}).replay();
                } else {
                    burst.generate().tune({x:142, y:-77}).replay();
                }
                let cnt = formatBytes(data.like_cnt, 1)
                $('#likeCounter').html(cnt);
                // $('#likeCounter').html(data.like_cnt);
            } else {
                console.log("조회 실패")
            }
        }, "json");
    })

}

// 좋아요 동기화 끊기
function likeEnd() {

    clearInterval(like_interval)

}

// 좋아요 단위 변환
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['', 'K', 'M', 'B', 'T'];
    let dmSize = '1'
    for (let i = 0; i < dm; i++) {
        dmSize += "0"
    }
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const number = Math.abs(bytes / Math.pow(k, i))
    const temp = number * Number(dmSize)
    const temp2 = Math.floor(temp)
    const result = temp2 / Number(dmSize)

    return result + sizes[i];
}