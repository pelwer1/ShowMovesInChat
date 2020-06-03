// working code 5/8/2020 ( not really - fails if size attr is missing)
//
// 05/08/2020 initial version
// 05/10/2020 added broken code for reach and AP; noticed Size check fails if character has not size value
// 05/20/2020 got everything working
// 05/23/2020 merged in show bio in chat
//
// show character bio in chat and send token mod command line to chat to update default token
// !show-tm-cmd @{target|token_id} 
//
// creates cmd line like this:
//     !token-mod --set aura1_radius|1 aura1_color|FF0000 aura2_radius|0.5 aura2_color|800080 bar1_value|AR2  bar2_value|x1F  bar3_value|W1H
//
// 
on('ready', function() {
    on('chat:message', function(msg) {
       if (msg.type === "api" && msg.content.indexOf("!show-tm-cmd") !== -1) {
            var tokenid = msg.content.split(/\s+/)[1];
            var charid = getObj("graphic", tokenid).get("represents");
            var c = getObj('character', charid);
            c.get('bio', function (text) {
 
                 // send bio to chat
                 sendChat('','/w gm <h3>MOVES</h3>------------------------------------------<br>'+text+'<br>');
                
                // split on edges
                var re = /edge[s*]/i; // first match only
                var lines = text.split(re);
                
                // reach may be in weapons above edges - so search lines[0]
                var reach = '';
                var reachMatch = 0;
                var regexp = /reach\:?\s+(\d+)/i;
                if ( regexp.test(lines[0]) ) {  
                     reachMatch = lines[0].match(/reach\:?\s+(\d+)/i); // reach 2  reach:2            
                     reach = 'statusmarkers|5-Reach:'+reachMatch[1]+' ' ;  
                }
                
                // AP may be above edges 
                var armorPierce = '';
                var apMatch = 0;
                regexp = /AP\:?\s+(\d+)/i; // AP 2  AP:2
                if ( regexp.test(lines[0]) ) {  
                    apMatch = lines[0].match(/AP\:?\s+(\d+)/i); // AP 2  AP:2
                    armorPierce = 'statusmarkers|5-ArmorPierce:'+apMatch[1]+' ';  
                }                 

                // declare vars 
                var wounds = 1;
                var size = 0;
                var arcResist = '';
                var aura1 = '';
                var aura2 = '';
                var i = 0;
                var attacks = '1';
                var frenzy = '';
                var sweep = '';
                var hardy = '';
                var large = '';
                var fear = '';
        
   
                for (i = 1; i < lines.length; i++ ) {
                    // wounds
                    // look for extreme size
                    regexp = /size\s+\+?\s*(\d+)/i;
                    if ( regexp.test(lines[i]) ) {  
                       size = lines[i].match(/size\s+\+?\s*(\d+)/i); // size +4 or size 4
                       sizeValue = parseInt(size[1]);
                       // sendChat('','/w gm Size: '+size+'<br>');
                       if ( sizeValue > 3 ) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:2 ';  }
                       if ( sizeValue > 7 ) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:4 '; }
                       if ( sizeValue > 11) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:6 '; }
                       if ( sizeValue > 15) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:6 '; }
                    }
                    regexp = /hardy/i;
                    if ( regexp.test(lines[i]) ) {  hardy = 'H '; }
                    regexp = /resilient/i;
                    if ( regexp.test(lines[i]) ) {  wounds = wounds + 1; }
                    regexp = /v\w*\s+resilient/i; 
                    if ( regexp.test(lines[i]) ) {  wounds = wounds + 1; }
                    
                    // fear
                    regexp = /fear/i;
                    if ( regexp.test(lines[i]) ) {  fear = 'statusmarkers|5b-Fear '; }

                    // reach check after edges
                    regexp = /reach\:?\s+(\d+)/i;
                    if ( regexp.test(lines[i]) ) {  
                      reachMatch = lines[i].match(/reach\:?\s+(\d+)/i); // reach 2  reach:2            
                      reach = 'statusmarkers|5-Reach:'+reachMatch[1]+' ' ;  
                    } 
                                       
                    // check AP after edges
                    regexp = /AP\:?\s+(\d+)/i;                
                    if ( regexp.test(lines[i]) ) {  
                       apMatch = lines[i].match(/AP\:?\s+(\d+)/i); // AP 2  AP:2
                       armorPierce = 'statusmarkers|5-ArmorPierce:'+apMatch[1]+' ';  
                    }                  

                    // arcane resistance
                    regexp = /arc\w*\s+resist/i;
                    if ( regexp.test(lines[i]) ) { arcResist = 'bar1_value|AR2 '; }
                    regexp = /imp\w*\s+arc\w*\s+resist/i;
                    if ( regexp.test(lines[i]) ) { arcResist = 'bar1_value|AR4 '; }

                    // attacks
                    regexp = /sweep/i;
                    if ( regexp.test(lines[i]) ) { sweep = 'S'; }
                    regexp = /frenzy/i;
                    if ( regexp.test(lines[i]) ) { frenzy = 'F'; }
                    regexp = /imp\w*\s+frenzy/i;
                    if ( regexp.test(lines[i]) ) { frenzy = 'F'; attacks = '2'; }
                    regexp = /claw.*bite/i;
                    if ( regexp.test(lines[i]) ) { attacks = '2'; }
                    regexp = /bite.*claw/i;
                    if ( regexp.test(lines[i]) ) { attacks = '2'; }

                    // auras
                    regexp = /(extract|first|counter\s+att)/i;
                    if ( regexp.test(lines[i]) ) { aura1 = "aura1_radius|1 aura1_color|FF0000 "; }
                    regexp = /(chaos|chaotic|feature|cf)/i;
                    if ( regexp.test(lines[i]) ) { aura2 = "aura2_radius|0.5 aura2_color|800080 "; } 
                }
                // build the token mod command
                var printOut = "!token-mod --set bar2_value|x"+attacks+frenzy+sweep+" "+aura1+aura2+reach+arcResist+ "bar3_value|W"+wounds.toString()+hardy+" "+large+armorPierce  ;
                sendChat('','/w gm <b>Token Mod Command:</b><br>'+printOut+' defaulttoken<br>');
            });
       };
    });
});
