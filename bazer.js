var FollowBeizer = function(options){
    this.parent              = options.parent            || null;
    this.text                = options.text              || null;
    
    this.control_points      = options.control_points    || null;
    
    this.aniDelay            = options.aniDelay          || 20;
    this.charDelay           = options.charDelay         || 300;
    this.end_text_align      = options.end_text_align    || null;
    this.final_font          = options.final_font        || null;
    this.spaceSize           = options.spaceSize         || 12;// sizes of space character
    this.charSpace           = options.charSpace || 0,

    this.font_increment      = 0;
    this.no_cordinates       = 100;
    this.start_point         = options.control_points[0];
    this.no_control_points   = options.control_points.length;

    this.beizer_points       = [];//hold all the beizer curve point of each character        
    this.real_con_point      = [];
    this.charWidth           = [];
   

// console.log(this.obj);
// if(!(this.obj.control_points instanceof Array) || this.obj.control_points.length < 2 ){
//     return 'invalid control points';
// }
// if(!(this.obj.end_points instanceof Array) || obj.end_points.length == 0 ){
//     return 'invalid end points';
// }
// if(typeof(this.obj.move) !== "number"){
//     return 'invalid move value';
// }
// if(typeof(obj.end_text_align) !== "string" && !(obj.end_text_align instanceof Array)){
//     return 'invalid end_text_align value';
// }
// obj.start_point        = obj.control_points[0];
// obj.no_control_points  = obj.ontrol_points.lecngth;
}
FollowBeizer.prototype.prepareTxt = function(){
var txt = Array.from(this.text);   
ele = document.getElementById(this.parent);

ele.innerHTML = '<div style="font-size:'+this.final_font+'px;position:absolute;visibility: hidden;">'+txt.join('</div><div  style="font-size:'+this.final_font+'px;position:absolute;visibility: hidden;">')+'</div>';


this.font_increment = (this.final_font-1)/this.no_cordinates;

var child = ele.children;
// getting the actual width of each characters
for(i=0;i < child.length;i++){
    var wd = parseFloat(window.getComputedStyle(child[i], null).getPropertyValue('width'));
    wd = (wd ===0)?this.spaceSize:wd;
    this.charWidth.push(wd + this.charSpace );
}

ele.innerHTML = '<div style="font-size:0px;position:absolute;" >'+txt.join('</div><div  style="font-size:0px;position:absolute;" >')+'</div>';

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
for(var i=0; i < this.no_control_points; i++){
    points  = Math.pow((1-t),(this.no_control_points-1-i) ) * cp[i][typ] * Math.pow(t,i);
    if(i > 0 && i < (this.no_control_points-1) ){
        points =  (this.no_control_points-1) * points;
    }
    point = point+ points;
}
return point;
}
FollowBeizer.prototype.fetchCordinates = function(ele){

var seg = (1/this.no_cordinates).toFixed(2);
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
FollowBeizer.prototype.anim = function(ele,points,incre,aniPos){


ele.style.left = points[incre][0]+'px';
ele.style.top =  points[incre][1]+'px';   
var fs = parseFloat(window.getComputedStyle(ele, null).getPropertyValue('font-size'))+this.font_increment;
if( fs < this.final_font){
    ele.style.fontSize =  fs+'px';
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
text            :'-> Ujwal Rai',
control_points  : [[350,350],[650,450],[550,300],[400,300],[400,200],[600,200],[600,100],[0,80]],
end_text_align  :'',
final_font      :70,
charDelay:200,
aniDelay :8
});



var para = new FollowBeizer({
parent          :'title',
text            :'Full Stack Developer | Focus on backend',
control_points  : [[350,350],[850,450],[550,300],[400,300],[400,200],[600,200],[600,100],[0,240]],
end_text_align  :'',
final_font      :20,
// charSpace :1,
charDelay:80,
aniDelay :5
});

function mixColor(id,no,off,cb){
// document.getElementById(id).children[no].style.color='#19a57f';
document.getElementById(id).children[no].style.color='rgb(18, 109, 152)';


if(no < off){
    setTimeout(function(){ 
       
        mixColor(id,no+1,off,cb);
    },100);
}
else{
    if(cb!==undefined){
        cb();
    }        
}
}

obj.start(function(){para.start(function(){
// mixColor('nav',0,7,function(){
  
// });
});});
setTimeout(function(){ 
       
document.querySelector('nav ul li:nth-child(3)').style.marginLeft = '0';


setTimeout(function(){ 

document.querySelector('nav ul li:nth-child(2)').style.marginLeft = '0';
setTimeout(function(){ 
    
    
    document.querySelector('nav ul li:nth-child(1)').style.marginLeft= '0';
    document.querySelector('nav').style.marginLeft= '100px';
    setTimeout(function(){
        document.querySelector('nav').style.marginLeft= '0px';
    },800);
    
 },1400);

},1400);
},1400);