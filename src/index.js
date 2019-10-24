import './styles/style.css';
import './emojis/styles/emoji.css';
import './emojis/img/blank.gif';
import './emojis/img/emoji_spritesheet_0.png';
import './emojis/img/emoji_spritesheet_1.png';
import './emojis/img/emoji_spritesheet_2.png';
import './emojis/img/emoji_spritesheet_3.png';
import './emojis/img/emoji_spritesheet_4.png';
import './emojis/img/IconsetSmiles_1x.png';
import './emojis/img/IconsetSmiles_1x.png';
import './emojis/img/IconsetSmiles.png';
import './emojis/img/IconsetW_1x.png';
import './emojis/img/IconsetW.png';

let isLightThemeSelected = true;

$(function () {

  let colors = [
    'cornflowerblue', 'orangered', 'blue', 'mediumpurple', 'hotpink',
    'teal', 'sandybrown', 'crimson', 'aqua', 'brown'
  ];

  let avatars = new Array(8);

  avatars[0] = new Image(50,50);
  avatars[0].src = "vasil.jpg";
  avatars[1] = new Image(50,50);
  avatars[1].src = "unknown.jpg";
  avatars[2] = new Image(50,50);
  avatars[2].src = "christian.jpg";
  avatars[3] = new Image(50,50);
  avatars[3].src = "abhinav.jpeg";
  avatars[4] = new Image(50,50);
  avatars[4].src = "avatar_movie.jpg";
  avatars[5] = new Image(50,50);
  avatars[5].src = "clone_trooper.png";
  avatars[6] = new Image(50,50);
  avatars[6].src = "cool_lama.jpg";
  avatars[7] = new Image(50,50);
  avatars[7].src = "unicorn.jpg";

  let currentAvatar;
  let initialized = false;
  // Chat platform
  const chatTemplate = Handlebars.compile($('#chat-template').html());
  const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
  const chatEl = $('#chat');
  const formEl = $('.form');
  const messages = [];
  let username;

  let userColorMapping = {};

  // Local/Remote Video
  const cameraContainerWrapper = $('#camera-container-wrapper');

  // Remote Videos
  const remoteVideosEl = $('#remote-videos');
  let remoteVideosCount = 0;

  // Add validation rules to Create/Join Room Form
  formEl.form({
    fields: {
      roomName: 'empty',
      username: 'empty'
    },
  });
  let webrtc;
  if (!initialized) {
    // create our webrtc connection
    webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: 'local-video',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: 'remote-videos',
      // immediately ask for camera access
      autoRequestMedia: true,
      // for development mode
      url: 'http://localhost:8888',
      // for production mode
      // url: 'https://lit-hollows-18487.herokuapp.com',
      debug: true,
      detectSpeakingEvents: false,
      autoAdjustMic: true,
    });
    initialized = true;
  }

  $('#profile').on('click', () => {
    $('#profile-modal').modal({ closable: false }).modal('show');
    // modal can be closed
    $('#clsBtn').on('click', () => {
      $('#profile-modal').modal('hide');
    });
  });

  // Remote video was added
  webrtc.on('videoAdded', (video, peer) => {
    if (remoteVideosCount > 2) {
      console.log('Maximum number of users is obtained!');
      return;
    } else {
      remoteVideosEl.append(video);
      $('video[autoplay]').addClass('column ui image medium');
      remoteVideosCount += 1;
    }
  });

  webrtc.on('videoRemoved', (video, peer) => {
    console.log('video removed', video, peer);
  });

  // Update Chat Messages
  const updateChatMessages = () => {
    const html = chatContentTemplate({ 
      messages: messages
    });
    const chatContentEl = $('.chat-content').html(html);
    // apply theme styling whenever a new message is posted
    isLightThemeSelected ? lightTheme(): darkTheme();
    // automatically scroll downwards
    const scrollHeight = chatContentEl.prop('scrollHeight');
    chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
  };

  // Post Local Message
  const postMessage = (message) => {
    const chatMessage = {
      username: username,
      message: message,
      postedOn: new Date().toLocaleString('en-GB'),
      // get only the relative path
      avatar: currentAvatar.src.split('/')[3],
      color: userColorMapping[username]
    };
    // Send to all peers
    webrtc.sendToAll('chat', chatMessage);
    // Update messages locally
    messages.push(chatMessage);
    $('.post-message').val('');
    updateChatMessages();
  };

  // Display Chat Interface
  const showChatRoom = (room) => {
    // only pause video per default, mic is working
    webrtc.pauseVideo();
    currentAvatar = getRandomAvatarIcon();
    formEl.hide();
    const html = chatTemplate({
      room: room, chatType: 'normalChat'
    });
    chatEl.html(html);
    // add emoji support to normal chat template
    window.emojiPicker = new EmojiPicker({
      emojiable_selector: '[data-emojiable=true]',
      assetsPath: './',
      popupButtonClasses: 'fa fa-smile-o'
    });
    window.emojiPicker.discover();
    // add tabindex attribute to div element to handle keyboard events on this element
    $('.emoji-wysiwyg-editor.input-msg').attr('tabindex', '0');
    // video call modal logic
    $('#callBtn').on('click', () => {
      $('#call-modal').modal({ closable: false }).modal('show');
      // modal can be closed
      $('#closeBtn').on('click', () => {
        $('#call-modal').modal('hide');
        webrtc.pauseVideo();
        webrtc.mute();
      });
      // show modal content
      $('#chatContentModal').html(chatTemplate({ chatType: 'modalChat' }));
      isLightThemeSelected ? lightTheme(): darkTheme();
      // add emoji support to modal chat template
      window.emojiPicker = new EmojiPicker({
        emojiable_selector: '[data-emojiable=true]',
        assetsPath: './',
        popupButtonClasses: 'fa fa-smile-o'
      });
      window.emojiPicker.discover();
      // hide local/remote cameras
      cameraContainerWrapper.hide();
      // always hide remote/local videos whenever user presses the call button
      if ($('#videoBtn').hasClass('active')) {
        // create a mock click event when changing active property
        $('#videoBtn').trigger('click');
        $('#videoBtn').removeClass('active');
        $('#videoBtn').addClass('inactive');
      }
      postMessage(`${username} is calling`);
      // handle modal chat input
      handleEnteredText(true);
    });
    $('#trashBtn').on('click', () => {
      messages.splice(0, messages.length);
      updateChatMessages();
    });
    // handle normal chat input
    handleEnteredText(false);
    $('.conversation-compose .ui .form').addClass('')
    $("#publicBtn").css('display', 'none');
    $("#privateBtn").css('display', 'none');
    toggleVideo();
    toggleAudio();
  };

  const handleEnteredText = (isInputFromModal) => {
    let selectorToInputField = isInputFromModal ? '#chatContentModal .emoji-wysiwyg-editor.input-msg' : '.emoji-wysiwyg-editor.input-msg';
    // enter click event
    $('.post-btn').on('click', (event) => {
      // get the inner html content from the div element
      const message = $(selectorToInputField).text();
      // delete the inner html content
      $(selectorToInputField).text('');
      if (!message) return;
      // only send message once (!) if user is in modal or in normal chat
      if (isInputFromModal && event.target.parentElement.parentElement.classList.contains('modalChat')) {
        postMessage(message);
      } else if (!isInputFromModal && event.target.parentElement.parentElement.classList.contains('normalChat')) {
        postMessage(message);
      } // else nothing should happen

    });
    // enter keyboard event
    $('.emoji-wysiwyg-editor.input-msg').on('keyup', (event) => {
      if (event.keyCode === 13) {
        const message = $(selectorToInputField).text();
        $(selectorToInputField).text('');
        if (!message) return;
        if (isInputFromModal && event.target.parentElement.classList.contains('modalChat')) {
          postMessage(message);
        } else if (!isInputFromModal && event.target.parentElement.classList.contains('normalChat')) {
          postMessage(message);
        } // else nothing should happen
      }
    });
  }

  // Register new Chat Room
  const createRoom = (roomName) => {
    console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      formEl.form('clear');
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
    });
  };

  // Join existing Chat Room
  const joinRoom = (roomName) => {
    console.log(`Joining Room: ${roomName}`);
    webrtc.joinRoom(roomName, (err, desc) => {
      console.info('desc', desc);
    });
    showChatRoom(roomName);
    postMessage(`${username} joined chatroom`);
  };

  const toggleVideo = () => {
    var state = false;
    $('#videoBtn').on('click', function () {
      if (state) {
        $('#videoBtn').toggleClass('active');
        webrtc.pauseVideo();
        webrtc.emit('videoOff');
        state = false;
        console.log("Disable Video")
      } else {
        $('#videoBtn').toggleClass('active');
        cameraContainerWrapper.show();
        webrtc.resumeVideo();
        webrtc.emit('videoOn');
        state = true;
        console.log("Enable video")
      }
    });

  };
  const toggleAudio = () => {
    var state = true;
    $('#audioBtn').on('click', function () {
      if (state) {
        $('#audioBtn').toggleClass('active');
        webrtc.mute();
        state = false;
        console.log("Mute Audio");
      } else {
        $('#audioBtn').toggleClass('active');
        webrtc.unmute();
        state = true;
        console.log("Unmute Audio");
      }
    });
  };

  // Receive message from remote user
  webrtc.connection.on('message', (data) => {
    if (!$('chat-form').form('is valid')) {
      return false;
    } else {
      if (data.type === 'chat') {
        const message = data.payload;
        if (!userColorMapping[message.username]) {
          // make sure that every remote user uses a different color
          while (Object.values(userColorMapping).includes(message.color)) {
            message.color = getRandomColor();
          }
          userColorMapping[message.username] = message.color; 
        }
        messages.push(message);
        updateChatMessages();
      }
    }
  });

  // Room Submit Button Handler
  $('.submit').on('click', (event) => {
    if (!formEl.form('is valid')) {
      $.alert({
        title: 'Invalid user input!',
        content: 'Please enter a room name and a user name!',
      });
      return false;
    }
    username = $('#username').val();
    const roomName = $('#roomName').val().toLowerCase();
    const password = $('#password').val().toLowerCase();
    userColorMapping[username] = getRandomColor();
    if (event.target.id === 'create-btn') {
      password ? createRoom(roomName + '#' + password) : createRoom(roomName);
    } else {
      password ? joinRoom(roomName + '#' + password) : joinRoom(roomName);
    }
    return false;
  });

  const getRandomAvatarIcon = () => {
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  }
});


export function privateRoom() {
  $('#password').css('visibility', 'visible');
  $('#pw-label').css('visibility', 'visible');
  $('#publicBtn').css('visibility', 'visible');
}
export function publicRoom() {
  $('#password').css('visibility', 'hidden');
  $('#pw-label').css('visibility', 'hidden');
}

export function darkTheme() {
  isLightThemeSelected = false;
  $('.pusher').css("background", "black");
  $('.w3-container').css("background", "black");
  $('#call-modal').css("background", "darkslateblue");
  $('#call-modal .scrolling.content').css("background", "darkslateblue");
  $('#call-modal .header').css("background", "darkslateblue");
  $('.clsBtnModal').css("background", "black");
  $('#user').css("color", "white");
  $('#room').css("color", "white");
  $('.summary').css("color", "white");
  $('.extra-text').css("color", "white");
  $('.date').css("color", "white");
  $('.username').css("color", "white");
}

export function lightTheme() {
  isLightThemeSelected = true;
  $('.pusher').css("background", "#b3ada7");
  $('.w3-container').css("background", "#b3ada7");
  $('#call-modal').css("background", "#b3ada7");
  $('#call-modal .scrolling.content').css("background", "#b3ada7");
  $('#call-modal .header').css("background", "#b3ada7");
  $('.clsBtnModal').css("background", "#b3ada7");
  $('#user').css("color", "black");
  $('#room').css("color", "black");
  $('.summary').css("color", "black");
  $('.extra-text').css("color", "black");
  $('.date').css("color", "black");
  $('.username').css("color", "black");
}