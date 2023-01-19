// 스택
class Stack {
  constructor() {
    this.arr = [];
    this.index = 0;
  }
  push(item) {
    this.arr[this.index++] = item;
  }
  pop() {
    if (this.index <= 0) return null;
    const result = this.arr[--this.index];
    return result;
  }
  delete() {
    this.arr = [];
    this.index = 0;
  }
}

let privateChannel,
  openRoomId,
  creatorFlag = false,
  _enter = true,
  event_chat = new Stack(),
  event_newchat = new Stack();

// 새로운 채팅 초기화
function subInit() {
  // 채팅창 움직임 제어
  $('#draggable').draggable({
    containment: '.mobile',
    scroll: false,
    handle: '.newchat-popup-title',
    helper: 'original',
    opacity: 0.35,
  });

  // 메시지 전송
  $('#draggable > div.newchat-popup-input-btn > ul.send > li.btn_send')
    .off('click')
    .click(function (e) {
      privateChannel.sendMessage({
        message: $('#subContent').text(),
        messageType: JSON.stringify({ profile: res.profile }),
        mimeType: 'text',
      });
      $('#subContent').text('');
      $('#subContent').focus();
    });

  // 메시지 입력창 엔터
  $('#subContent').keydown(function (e) {
    if (e.keyCode == 13) {
      $('#draggable > div.newchat-popup-input-btn > ul.send > li.btn_send').trigger('click');
      e.preventDefault();
    }
  });

  // 특정유저로 메시지 전송
  let popupLayer = $('div.newchat-popupLayer');
  let whisperLayer = $('ul.popup_content li:nth-child(1)', popupLayer);
  popupLayer.close = function () {
    $('#newchat-whisper input[type=text][name=message]', whisperLayer).val('');
    $('#newchat-whisper', this).hide();
    $(this).hide();
  };

  // 특정유저로 메시지 입력창 엔터
  $('button', whisperLayer)
    .off('click')
    .click(function (e) {
      privateChannel.sendWhisper(
        {
          message: $('input[type=text][name=message]', whisperLayer).val(),
          receivedClientKey: popupLayer.data()['clientKey'],
        },
        function (err, msg) {
          if (err) return openError(err.code);
          write(msg, 'whisperto', null, true);
        }
      );
      e.preventDefault();
      popupLayer.close();
    });

  // 유저리스트 팝업
  $('.chat-user-list_btn')
    .off('click')
    .click(function () {
      $('.chat-user-list-dim', $('.channel-popup-dim').addClass('active')).addClass('active');
      $('#chat > div.channel-popup-dim > div.chat-user-list-dim > div > div.chat-user-list-title > p:nth-child(2)')
        .off('click')
        .click(function () {
          $('.chat-user-list-dim', $('.channel-popup-dim').removeClass('active')).removeClass('active');
          event_trigger(false);
        });
    });
  // 새로운 채팅창 유저리스트 팝업
  $('#draggable > div.newchat-popup-subwrap > div.newchat-popup-title > p:nth-child(1) > a.chat-user-list_btn')
    .off('click')
    .click(function () {
      $('.newchat-user-list', $('.newchat-alret-dim').addClass('active')).addClass('active');
      $(
        '#draggable > div.newchat-popup-subwrap > div.newchat-alret-dim.active > div.newchat-alret-wrap.newchat-user-list.active > div.chat-user-list-title > p:nth-child(2)'
      )
        .off('click')
        .click(function () {
          $('.newchat-user-list', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
          event_trigger(true);
        });
    });

  // 새로운 채팅창 닫기 버튼
  $('#draggable > div.newchat-popup-subwrap > div.newchat-popup-title.ui-draggable-handle > p:nth-child(2) > a')
    .off('click')
    .click(function () {
      if (creatorFlag) {
        let closing = $('.closing', $('.newchat-alret-dim').addClass('active')).addClass('active');
        $('div.newchat-alret-btn-wrap > a:nth-child(1)', closing)
          .off('click')
          .click(function () {
            channelClose(openRoomId, function () {
              channel_leave();
              $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
            });
          });
        $('div.newchat-alret-btn-wrap > a:nth-child(2)', closing)
          .off('click')
          .click(function () {
            $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
            event_trigger(true);
          });
      } else {
        let out = $('.out', $('.newchat-alret-dim').addClass('active')).addClass('active');
        $('div.newchat-alret-btn-wrap > a:nth-child(1)', out)
          .off('click')
          .click(function () {
            channel_leave();
            $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
            $('#draggable').removeClass('active');
          });
        $('div.newchat-alret-btn-wrap > a:nth-child(2)', out)
          .off('click')
          .click(function () {
            $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
          });
      }
    });

  // 새로운 채팅 시작
  let chat_user = $('#chat > div.channel-popup-dim > div.chat-user-list-dim > div.chat-user-list-wrap');
  let new_chat_user = '#draggable > div.newchat-popup-subwrap > div.newchat-alret-dim > div.newchat-alret-wrap.newchat-user-list';

  // 기존 채팅 이벤트
  $('a', chat_user)
    .off('click')
    .click(function (e) {
      if (openRoomId) {
        if (creatorFlag) {
          let closing = $('.closing', $('.newchat-alret-dim').addClass('active')).addClass('active');
          $('div.newchat-alret-btn-wrap > a:nth-child(1)', closing)
            .off('click')
            .click(function () {
              channelClose(openRoomId, function () {
                channel_leave();
                $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
                newChat(chat_user);
              });
            });
          $('div.newchat-alret-btn-wrap > a:nth-child(2)', closing)
            .off('click')
            .click(function () {
              $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
              event_trigger(true);
            });
        } else {
          let out = $('.out', $('.newchat-alret-dim').addClass('active')).addClass('active');
          $('div.newchat-alret-btn-wrap > a:nth-child(1)', out)
            .off('click')
            .click(function () {
              $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
              channel_leave();
              $('#draggable').removeClass('active');
              newChat(chat_user);
            });
          $('div.newchat-alret-btn-wrap > a:nth-child(2)', out)
            .off('click')
            .click(function () {
              $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
            });
        }
      } else {
        newChat(chat_user);
      }
    });

  // 새로운 채팅 이벤트
  $('a', new_chat_user)
    .off('click')
    .click(function (e) {
      $('.newchat-user-list', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
      if (openRoomId) {
        if (creatorFlag) {
          let closing = $('.closing', $('.newchat-alret-dim').addClass('active')).addClass('active');
          $('div.newchat-alret-btn-wrap > a:nth-child(1)', closing)
            .off('click')
            .click(function () {
              channelClose(openRoomId, function () {
                channel_leave();
                $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
                newChat(new_chat_user);
              });
            });
          $('div.newchat-alret-btn-wrap > a:nth-child(2)', closing)
            .off('click')
            .click(function () {
              $('.closing', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
              event_trigger(true);
            });
        } else {
          let out = $('.out', $('.newchat-alret-dim').addClass('active')).addClass('active');
          $('div.newchat-alret-btn-wrap > a:nth-child(1)', out)
            .off('click')
            .click(function () {
              $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
              channel_leave();
              $('#draggable').removeClass('active');
              newChat(new_chat_user);
            });
          $('div.newchat-alret-btn-wrap > a:nth-child(2)', out)
            .off('click')
            .click(function () {
              $('.out', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
              event_trigger(true);
            });
        }
      } else {
        newChat(new_chat_user);
      }
    });
}

// 1:1 채팅 초대
function chatInvitation(user) {
  channelOpen(function () {
    _enter = true;
    creatorFlag = true;
    subJoinRoom(openRoomId, channel.clientKey, channel.nickName, function (err, history) {
      if (err) {
        if (errMsg[err.code] == undefined) {
          toastr.error(err.code);
        } else {
          toastr.error(errMsg[err.code].kor);
        }
        channel_leave();
        $('#draggable').removeClass('active');
      } else {
        // div 정리
        $('div input', $('div.chat-user-list-wrap > div.chat-user-list-contents > ul > li')).prop('checked', false);
        $('.chat-user-list-dim', $('.channel-popup-dim').removeClass('active')).removeClass('active');
        $('div', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
        sendInvite(openRoomId, user);

        // 채팅방 초기화
        res.roomInitTagRemove(true);
        $('.newchat-myname').text(channel.nickName);

        // 채팅영역에 글쓰기가 활성화될시 활성화
        let noticeMsgCnt = 0;
        if (typeof write == 'function')
          history &&
            history.forEach(function (m) {
              if (m.messageType == 'notice') {
                if (noticeMsgCnt == 0) {
                  noticeMsgCnt++;
                  write(m, 'notice', true, true);
                }
              } else {
                write(m, '', true, true);
              }
            });

        // 이벤트 바인딩 시작
        subChatInit();

        // 채팅창 활성화
        $('#draggable').addClass('active');

        // 실시간 채팅 안내
        if (typeof write == 'function') write(res.initMsg, 'notice', null, true);
      }
    });
  });
}

// 새로운 채팅방으로 생성 및 초대발송
function newChat(chat) {
  let flag = false;
  let targetList = [];
  let list = $('div.chat-user-list-contents > ul > li', chat);

  for (let i = 0; i < list.length; i++) {
    let item = $('div > input', list[i]);
    if (item.is(':checked')) {
      targetList.push(item.prop('id').split('invite_')[1]);
      flag = true;
    }
  }
  if (flag && _enter) {
    _enter = false;
    channelOpen(function () {
      _enter = true;
      creatorFlag = true;
      subJoinRoom(openRoomId, channel.clientKey, channel.nickName, function (err, history) {
        if (err) {
          if (errMsg[err.code] == undefined) {
            toastr.error(err.code);
          } else {
            toastr.error(errMsg[err.code].kor);
          }
          channel_leave();
          $('#draggable').removeClass('active');
        } else {
          // div 정리
          $('div input', $('div.chat-user-list-wrap > div.chat-user-list-contents > ul > li')).prop('checked', false);
          $('.chat-user-list-dim', $('.channel-popup-dim').removeClass('active')).removeClass('active');
          $('div', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
          for (let j = 0; j < targetList.length; j++) {
            console.log(targetList[j]);
            sendInvite(openRoomId, targetList[j]);
          }

          // 채팅방 초기화
          res.roomInitTagRemove(true);
          $('.newchat-myname').text(channel.nickName);

          // 채팅영역에 글쓰기가 활성화될시 활성화
          let noticeMsgCnt = 0;
          if (typeof write == 'function')
            history &&
              history.forEach(function (m) {
                if (m.messageType == 'notice') {
                  if (noticeMsgCnt == 0) {
                    noticeMsgCnt++;
                    write(m, 'notice', true, true);
                  }
                } else {
                  write(m, '', true, true);
                }
              });

          // 이벤트 바인딩 시작
          subChatInit();

          // 채팅창 활성화
          $('#draggable').addClass('active');

          // 실시간 채팅 안내
          if (typeof write == 'function') write(res.initMsg, 'notice', null, true);
        }
      });
    });
  } else {
    console.log(flag, _enter);
    toastr.error('대화상대를 한사람 이상 선택 하셔야합니다.');
    _enter = true;
  }
}

// 채널 오픈
function channelOpen(callback, roomId) {
  if (roomId == undefined) {
    openRoomId = channel.roomId + '-' + new Date().getTime() + '_' + channel.clientKey;
  } else {
    openRoomId = roomId;
  }
  privateChannel = vChatCloud.openChannel(
    {
      roomId: openRoomId,
      clientKey: channel.clientKey,
    },
    function (err, res) {
      if (res) {
        setTimeout(() => {
          callback();
        }, 200);
      } else {
        toastr.error('채팅방 생성 실패');
      }
    }
  );
}

// 채널 파기
function channelClose(roomId, callback) {
  if (roomId == undefined) {
    roomId = privateChannel.roomId;
  }

  vChatCloud.closeChannel(
    {
      roomId: roomId,
      clientKey: channel.clientKey,
    },
    async function (err, res) {
      // 성공 여부 상관없이 리턴
      creatorFlag = false;
      await this.sendCustomMsg({ openRoomId: roomId, type: 'subOut', clientKey: channel.clientKey });
      callback();
    }
  );
}

// 새로운 채팅방 접속
function subJoinRoom(roomId, clientKey, nickName, callback) {
  // vchatcloud 객체
  privateChannel = vChatCloud.joinChannel(
    {
      roomId: roomId,
      clientKey: clientKey,
      nickName: nickName,
      userInfo: {
        profile: res.profile,
      },
    },
    function (error, history) {
      res.roomInitTagRemove(true);
      if (error) {
        if (callback) return callback(error, null);
        return error;
      }
      if (callback) callback(null, history);
    }
  );
}

// 초대 이벤트 발송
function sendInvite(roomId, clientKey) {
  channel.sendInvite(
    {
      roomId: roomId,
      clientKey: clientKey,
    },
    function () {
      // console.log('sendInvite', arguments)
    }
  );
}

// 새로운 채팅창 닫기
function chat_close(callback) {
  let end = $('.end', $('.newchat-alret-dim').addClass('active')).addClass('active');
  $('div.newchat-alret-btn-wrap > a', end)
    .off('click')
    .click(function () {
      callback();
      $('.end', $('.newchat-alret-dim').removeClass('active')).removeClass('active');
    });
}

// 채널 나가기
function channel_leave() {
  // openRoomId = null
  privateChannel.leave(function () {});
}

// 이벤트 예약
function event_reservation(fun, sub) {
  if (sub) {
    if ($('.newchat-alret-dim').is(':visible')) {
      return event_newchat.push(fun);
    }
  } else {
    if ($('.channel-popup-dim').is(':visible')) {
      return event_chat.push(fun);
    }
  }
  fun();
}

// 예약 이벤트 실행
function event_trigger(sub) {
  let event, target;
  if (sub) {
    if (!$('.newchat-alret-dim').is(':visible')) {
      event = event_newchat.pop();
      if (event) {
        return event();
      }
    }
  } else {
    if (!$('.channel-popup-dim').is(':visible')) {
      event = event_chat.pop();
      if (event) {
        return event();
      }
    }
  }
}

// 예약 이벤트 삭제
function event_delete(sub) {
  if (sub) {
    event_newchat.delete();
  } else {
    event_chat.delete();
  }
}
