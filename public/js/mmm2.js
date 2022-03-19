let customers = [], payloads = [];
 let counter = 0, updateCounter = 0;

 function bomb(){
    let x = customers[counter];
    console.log("x: ",x);
    fetch(`/ometria-get-customer?email=${encodeURIComponent(x.email)}`)
    .then(response => response.json())
    .then(d => {
        if(d.data){
          
            setTimeout(function(){
                console.log("d.data: ", d.data);
                ++counter; 
                if(counter < customers.length) bomb();
                },1000);      
        }
    });  
 }

function showElem(selector){
    let names = [];

    if(Array.isArray(selector)){
        names = selector;
      }
      else{
          names.push(selector);
      }

      for(let i = 0; i < names.length; i++){
        let el = document.querySelector(names[i]);
        if(el){
          el.style.display = 'block';
        }
    }
}

function hideElem(selector){
    let names = [];

    if(Array.isArray(selector)){
        names = selector;
      }
      else{
          names.push(selector);
      }

      for(let i = 0; i < names.length; i++){
          let el = document.querySelector(names[i]);
        if(el){
          el.style.display = 'none';
        }
    }
}


function bomb(){
    let x = customers[counter];
    console.log("x: ",x);
    fetch(`/ometria-get-customer?email=${encodeURIComponent(x.email)}`)
    .then(response => response.json())
    .then(d => {
        if(d.data){
          
            setTimeout(function(){
                console.log("d.data: ", d.data);
                ++counter; 
                if(counter < customers.length) bomb();
                },1000);      
        }
    });  
 }

function update(){
    let x = pv[updateCounter];
    console.log("x in update(): ", x);
    //Update 
    //Step 1: Fetch the provudct variant data from Shopify
    fetch(`/shopify-product-variants?pv=${x.pv}`)
        .then(response => response.json())
        .then(d => {
            if(d.data){
                let selected = d.data.find(i =>{ 
                    let temp = x.pv.split("_");
                    if(i.id == temp[1]) return i;
                });
    
                if(selected){
                    selected.email = x.email;
                //console.log("selected: ",selected);
                
                //Step 2 - Fetch the customer custom fields from Ometria
                fetch(`/ometria-get-customer?email=${encodeURIComponent(selected.email)}`)
                .then(response => response.json())
                .then(d => {
                    if(d.data){
                        console.log("[selected,d.data]: ",[selected,d.data]);
                        let ometriaProperties = d.data.properties;
                        let custom_fields = {}, toBeUpdated = false;

                        switch(selected.title){
                          case "5 ml":
                          case "5ml":
                              if(ometriaProperties.has_bought_5ml){
                                //custom_fields['has_bought_5ml'] = ometriaProperties['has_bought_5ml'] + 1;
                              }
                              else{
                                custom_fields['has_bought_5ml'] = 1;
                                toBeUpdated = true;
                              }
                          break;

                          case "30 ml":
                          case "30ml":
                              if(ometriaProperties.has_bought_30ml){
                                //custom_fields['has_bought_30ml'] = ometriaProperties['has_bought_30ml'] + 1;
                              }
                              else{
                                custom_fields['has_bought_30ml'] = 1;
                                toBeUpdated = true;
                              }
                          break;

                          case "50 ml":
                          case "50ml":
                              if(ometriaProperties.has_bought_50ml){
                               // custom_fields['has_bought_50ml'] = ometriaProperties['has_bought_50ml'] + 1;
                              }
                              else{
                                custom_fields['has_bought_50ml'] = 1;
                                toBeUpdated = true;
                              }
                          break;

                          case "100 ml":
                          case "100ml":
                              if(ometriaProperties.has_bought_100ml){
                               // custom_fields['has_bought_100ml'] = ometriaProperties['has_bought_100ml'] + 1;
                            }
                            else{
                              custom_fields['has_bought_100ml'] = 1;
                              toBeUpdated = true;
                            }
                          break;
                        }

                         let payload = {
                            customer_id: selected.id,
                            customer_email: selected.email,
                            fields: custom_fields
                          };

                          console.log("[payload, toBeUpdated]: ",[payload,toBeUpdated]);
                        
                        //Step 3 - Populate the appropriate custom field and update Ometria
                        payloads.push({
                            payload,
                            toBeUpdated
                        });  
                        

                            setTimeout(function(){
                                //console.log("d.data: ", d.data);
                                ++updateCounter; 
                                if(updateCounter < pv.length) update();
                                else document.querySelector('#results-textarea').value = JSON.stringify(payloads);
                                },1000); 
                    }
                })
                
               }

              
            
            }
            
        });
}

function updateOmetria(){
	let x = payloads[updateCounter];
    console.log("x: ",x);
    #('#update-pv-loading').html(`<b>Updating data for ${x.customer_email}</b>`);
    showElem('#update-pv-loading');
    const req = new Request("/update-ometria",{
                method: 'POST', 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(x)
            });
    fetch(`/update-ometria`)
    .then(response => response.json())
    .then(d => {
        if(d.data){
          
            setTimeout(function(){
                console.log("d.data: ", d.data);
                hideElem('#update-pv-loading');
                ++updateCounter; 
                if(updateCounter < payloads) updateOmetria();
                },1000);      
        }
    });  
}


$(document).ready(() => {
    //Custom fields update
    hideElem([
         '#update-form-status','#update-form-loading',
         '#ometria-id-error','#ometria-email-error','#ometria-fields-error'
        ]);

    $('#update-form').submit(async e => {
        e.preventDefault();
        hideElem([
            '#ometria-id-error','#ometria-email-error','#ometria-fields-error'
           ]);
        console.log("Submitting..");
        
        let o_id = $('#ometria-id').val(), o_email = $('#ometria-email').val(), o_fields = $('#ometria-fields').val(), custom_fields = {};

        if(o_id == "" || o_email == "" || o_fields == ""){
           if(o_id == "") showElem("#ometria-id-error");
           if(o_email == "") showElem("#ometria-email-error");
           if(o_fields == "") showElem("#ometria-fields-error");
        }
        else{
            showElem("#update-form-loading");
            let cf = o_fields.split("\n");
            
            for(let field of cf){
              let temp = field.split("=");
              custom_fields[temp[0]] = temp[1];
            }
            //console.log("Custom fields: ",custom_fields);
            const req = new Request("/update-ometria",{
                method: 'POST', 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer_id: o_id,
                    customer_email: o_email,
                    fields: custom_fields
                })
            });
            const send = await fetch(req);
            const response = await send.json();
            console.log("Response: ",response);
            hideElem("#update-form-loading");
            if(response.status == "ok"){
                hideElem("#update-form-loading");
                $("#update-form-status").html(response.message);
                showElem("#update-form-status");
                setTimeout(() => {
                    hideElem("#update-form-status");
                    $('#ometria-id').val(""); $('#ometria-email').val("");
                },1000);
            }
        }
    });

    

    document.querySelector('#updater2').addEventListener('click', e => {
        e.preventDefault();
        bomb2();
                  
    });

    
    document.querySelector('#update-pv-btn').addEventListener('click', e => {
        e.preventDefault();
        hideElem([
            '#update-pv-error','#update-pv-loading'
           ]);
           let pv = $('#update-pv-payload').val();
           
           if(pv.length < 10){
           	showElem('#update-pv-error');
           }
           else{
           	try{
           	 payloads = JSON.parse(pv);
                
                updateOmetria();
               }
               catch(e){
               	showElem('#update-pv-error');
               }
           	
           }
           
                  
    });
    
});
