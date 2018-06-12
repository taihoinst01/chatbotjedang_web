$(document).ready(function() {
	dictateMic.init();
});

//apikey 획득 정보 	  : https://azure.microsoft.com/ko-kr/try/cognitive-services/?api=speech-api
//var bingClientTTS = new BingSpeech.TTSClient("150528dddf6947509ec84ecd5e6584a7");
//var bingClientTTS = new BingSpeech.TTSClient("ccce5a983d5d4e8fa932dc521ec8df4e");
var bingClientTTS = new BingSpeech.TTSClient("83fd3c00159545bca411d0e26ce31636");


function lfn_speakTTS(text, speaker){
	bingClientTTS.multipleXHR = true;
	if(!speaker){
		speaker = BingSpeech.SupportedLocales.koKR_Female;
	}
	bingClientTTS.synthesize(text,speaker);
}

function lfn_stopTTS(){
	bingClientTTS.stop();
}

function printMsg(flag,msg){
	
	if(flag === 'guide'){
		//console.log(flag + " : " + msg);
		//lfn_speakTTS(hypText);
	}else{
        //console.log(flag + " : " + msg);

        $(".wc-shellinput").val(msg);
        $(".wc-shellinput").change();
        $('.wc-console').addClass('has-text');
        $(".wc-send").trigger("click");
        $(".wc-shellinput").val('');
        $('.wc-console').removeClass('has-text');
        //postButtonMessage(msg);
	}
}

