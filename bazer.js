var FollowBeizer = function(options){

    this.parent              = options.parent            || null;
    this.text                = options.text              || null;    
    this.control_points      = options.control_points    || null;
    
    this.aniDelay            = options.aniDelay          || 20;
    this.charDelay           = options.charDelay         || 300;
    this.end_text_align      = options.end_text_align    || 'inline';
    this.final_font          = options.final_font        || 20;
    this.spaceSize           = options.spaceSize         || 12;// sizes of space character
    this.charSpace           = options.charSpace         || 0;
    this.font_grow           = options.font_grow         || 'grow'

    this.font_increment      = 0;
    this.no_cordinates       = 150;
    this.start_point         = options.control_points[0];
    this.no_control_points   = options.control_points.length;

    this.beizer_points       = [];//hold all the beizer curve point of each character        
    this.real_con_point      = [];
    this.charWidth           = [];
   
}
FollowBeizer.prototype.prepareTxt = function(){
    var txt = Array.from(this.text);   
    ele = document.getElementById(this.parent);

    ele.innerHTML = '<div style="font-size:'+this.final_font+'px;position:absolute;visibility: hidden;">'+txt.join('</div><div  style="font-size:'+this.final_font+'px;position:absolute;visibility: hidden;">')+'</div>';

    var start_font = 0;
    if( this.font_grow=='grow'){
        this.font_increment = (this.final_font-1)/this.no_cordinates;
    }
    else{
        start_font = this.final_font;
    }
    
   
    var child = ele.children;
    // getting the actual width of each characters
    for(i=0;i < child.length;i++){
        var wd = parseFloat(window.getComputedStyle(child[i], null).getPropertyValue('width'));
        wd = (wd ===0)?this.spaceSize:wd;
        this.charWidth.push(wd + this.charSpace );
    }
    console.log(start_font);

    ele.innerHTML = '<div style="visibility: hidden;font-size:'+start_font+'px;position:absolute;" >'+txt.join('</div><div  style="visibility: hidden;font-size:'+start_font+'px;position:absolute;" >')+'</div>';

    this.setControlPoints(ele);
   
}
FollowBeizer.prototype.setControlPoints = function(ele){

    var len = this.control_points.length;
    for(i=0; i < this.charWidth.length; i++){
        var n_p = [];
        for(j=0; j < len;j++){
            if(j==len-1){
                var ofWid = 0;
                for(z=0;z<i;z++){
                    ofWid += this.charWidth[z];
                }
                
                n_p.push([(this.control_points[j][0] +ofWid ),this.control_points[j][1]]);
            }else{
                n_p.push(this.control_points[j]);
            }
        }
        this.real_con_point.push(n_p);
    }
    this.fetchCordinates(ele);
}
FollowBeizer.prototype.fetchBeizerPoint = function(cp,t,typ){
    var point = 0;
    var n = this.no_control_points-1;
    for(var i=0; i < this.no_control_points; i++){       
        points = this.ponlynominals(t,n,i) *  cp[i][typ];
        point = point+ points;
    }
    return point;
}
FollowBeizer.prototype.fetchCordinates = function(ele){

    var seg = (1/this.no_cordinates);
    for(j=0; j < this.real_con_point.length;j++){
        var cp = this.real_con_point[j];
        var n_p = [];
        for(i=1; i <= this.no_cordinates; i++){
            n_p.push([this.fetchBeizerPoint(cp,(seg*i),0),this.fetchBeizerPoint(cp,(seg*i),1)]);
        }
        this.beizer_points.push(n_p);
    }
    this.moveDelay(ele.children,0,this.beizer_points.length,1);
}

// polynominals calculation
FollowBeizer.prototype.ponlynominals = function (t,n,i){
    var bio = Math.pow(t,i) * Math.pow((1-t),(n-i));
    var fac =  this.factor(n) / (this.factor(i) * this.factor(n-i)) ;
    return bio* fac;    
}
// factor calculation
FollowBeizer.prototype.factor = function (number){
    var fact = 1;
    if(number > 1){
        for(var i=number; i >1; i--){
            fact = fact * i;
        }
    }
    return fact;
}


FollowBeizer.prototype.anim = function(ele,points,incre,aniPos){

    ele.style.left = points[incre][0]+'px';
    ele.style.top =  points[incre][1]+'px';   
    if( this.font_grow=='grow'){
        var fs = parseFloat(window.getComputedStyle(ele, null).getPropertyValue('font-size'))+this.font_increment;
        if( fs < this.final_font){
            ele.style.fontSize =  fs+'px';
        }
    }
    else{
        ele.style.visibility = 'visible';
    }
    if(incre < points.length-1){
        var ths = this;
        setTimeout(function(){ 
            ths.anim(ele,points,incre+1,aniPos);
        }, this.aniDelay );
    }
    else if(aniPos == this.charWidth.length){
        if(this.cb !==undefined){
            this.cb();
        } 
    } 

}
FollowBeizer.prototype.moveDelay = function(ele,i,len,aniPos){   
    this.anim(ele[i],this.beizer_points[i],0,aniPos);
    if(i <= len){
        var ths = this;
        setTimeout(function(){ 
            if(ths.beizer_points[i+1]!==undefined){
                ths.moveDelay(ele,i+1,len,aniPos+1);
            }
        }, this.charDelay);
    }
}

FollowBeizer.prototype.start = function(cb){
    this.cb = cb;
    this.prepareTxt(document.getElementById(this.id));  
}

var obj = new FollowBeizer({
parent          :'nav',
text            :'samsung',
control_points  : [[0,0],[500,500],[1000,0]],
end_text_align  :'',
final_font      :20,
charDelay:200,
aniDelay :20,
font_grow:'constant'
});

obj.start(function(){

});

