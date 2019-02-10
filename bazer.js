var FollowBeizer = function(options){

    this.parent              = options.parent            || null;
    this.text                = options.text              || null;    
    this.control_points      = options.control_points    || null;
    
    this.aniDelay            = options.aniDelay          || 20;
    this.charDelay           = options.charDelay         || 100;
    this.end_text_align      = options.end_text_align    || 'inline';
    this.final_font          = options.final_font        || 20;
    this.spaceSize           = options.spaceSize         || 12;// sizes of space character
    this.charSpace           = options.charSpace         || 0;
    this.font_grow           = options.font_grow         || 'constant'

    this.font_increment      = 0;
    this.no_cordinates       = 500;
    this.start_point         = options.control_points[0];
    this.no_control_points   = options.control_points.length;

    this.beizer_points       = [];//hold all the beizer curve point of each character        
    this.real_con_point      = [];
    this.charWidth           = [];

    if(this.parent == null ){
        throw new Error('There is no element is selected');
    }
    if(this.text == null ){
        throw new Error('no element is selected');
    }
    if(this.control_points == null || !(this.control_points instanceof Array) || this.control_points.length < 2){
        throw new Error('Invalid control points');
    }
   
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

    ele.innerHTML = '<div style="visibility: hidden;font-size:'+start_font+'px;position:absolute;" >'+txt.join('</div><div  style="visibility: hidden;font-size:'+start_font+'px;position:absolute;" >')+'</div>';

    this.setControlPoints(ele);
   
}
FollowBeizer.prototype.setControlPoints = function(ele){

    if(this.end_text_align=='incurve'){
        this.real_con_point.push(this.control_points);
    }else{
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
FollowBeizer.prototype.getTangent = function(cp,t,typ){
    var tanCof = 0;
    
    var n = this.no_control_points-1;
    for(var i=0; i < this.no_control_points-1; i++){       
        tanpo = this.ponlynominals(t,n-1,i) *  (cp[i+1][typ] -cp[i][typ]);
        tanCof = tanpo+ tanCof;
    }
    return n * tanCof;
}
FollowBeizer.prototype.fetchCordinates = function(ele){

    var seg = (1/this.no_cordinates);
    for(j=0; j < this.real_con_point.length;j++){
        var cp = this.real_con_point[j];
        var n_p = [];
        for(i=1; i <= this.no_cordinates; i++){
            var pts = [this.fetchBeizerPoint(cp,(seg*i),0),this.fetchBeizerPoint(cp,(seg*i),1)]
            if(this.end_text_align=='incurve'){
                var tangent = Math.atan2(this.getTangent(cp,(seg*i),1),this.getTangent(cp,(seg*i),0));
                pts.push( tangent * (180 / Math.PI));
                
            }
            n_p.push(pts);
        }
        
        this.beizer_points.push(n_p);
    }
    if(this.end_text_align=='incurve'){
        var tem_points = this.beizer_points[0];
        var segmentLength = this.getSegmentDistance();
        var segmentToLeave = [];
        console.log(this.charWidth);
        console.log(segmentLength);
        
        var new_points = [];
        for(var i=0; i < this.charWidth.length; i++){
            var totalSegment = 0;
            for(var j=i; j < this.charWidth.length; j++){
               
                totalSegment = totalSegment + Math.ceil((this.charWidth[j] + 10)/segmentLength) ;
               
                
            }
            // segmentToLeave
            var segmentLeave = totalSegment + Math.floor(this.charSpace/segmentLength) ;
            console.log(segmentLeave);
            new_points.push( tem_points.slice(0, (tem_points.length-segmentLeave )) );
        }
        this.beizer_points = new_points;
    }
    // console.log(this.beizer_points);
    // return;
    this.moveDelay(ele.children,0,this.beizer_points.length,1);
}
FollowBeizer.prototype.getSegmentDistance = function (){
    var point_1 = this.beizer_points[0][0];
    var point_2 = this.beizer_points[0][1];
    var x_diff= Math.pow( (point_1[0] - point_2[0]) , 2);
    var y_diff = Math.pow( (point_1[1] - point_2[1]) , 2);
    return Math.ceil(Math.sqrt(y_diff + x_diff));
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
        for(var i=number; i >0; i--){
            fact = fact * i;
        }
    }
    return fact;
}


FollowBeizer.prototype.anim = function(ele,points,incre,aniPos){

    ele.style.left = points[incre][0]+'px';
    ele.style.top =  points[incre][1]+'px';   
    if(this.end_text_align=='incurve'){
        ele.style.transform = "rotate("+points[incre][2]+"deg)";
    }
    if( this.font_grow=='grow'){
        var fs = parseFloat(window.getComputedStyle(ele, null).getPropertyValue('font-size'))+this.font_increment;
       
        if( fs < this.final_font){
            ele.style.fontSize =  fs+'px';
        }
    }
    ele.style.visibility = 'visible';
    
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



