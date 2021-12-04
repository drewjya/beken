import express from 'express';
import dotenv from 'dotenv';
import fetch from 'cross-fetch';
import { parse } from 'node-html-parser';
dotenv.config();

const router = express.Router();
const API_KEY = process.env.API_KEY || undefined;

router.get("/ingridient/:name", async (reg, res) =>{
    const { name } = reg.params;
    console.log(`GET /ingridients/${name} [START]`);
    console.log(`/ingridient/${name}`);
    let responseJSON = [];
    try {
        let JSON = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${name}&metaInformation=true&number=100&apiKey=${API_KEY}`, {method : "GET"});
        let APIdata = await JSON.json();
        APIdata.forEach(item => {
            responseJSON.push({
                id : item["id"],
                name : item["name"],
                imageLink : `https://spoonacular.com/cdn/ingredients_100x100/${item["image"]}`,
                units : item["possibleUnits"]
            })
        });
        console.log(`GET /ingridients/${name} [SUCCESS]`);
        res.status(200).json(responseJSON);
    } catch (error) {
        console.log(`GET /ingridients/${name} [ERROR]`);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/recipe", async (req, res) => {
    console.log('POST /recipe [START]');
    let { ingridients } = req.body;
    console.log(req.body);
    if(ingridients == undefined){
        console.log('POST /recipe [GAGAL]');
        res.status(505).send("ERROR - Bukan salah William 😝");
    }
    let list = "";

    ingridients.forEach((item, index)=>{
        if(index != ingridients.length-1) list = list + `${item.quantity} ${item.unit} ${item.name}` + "\n";
        else list = list + `${item.quantity} ${item.unit} ${item.name}`;
        
    })

    var details = {
        'ingredientList': list,
        'servings': 1,
        'defaultCss': false,
        'showBacklink' : false
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");


    let APIres = await fetch(`https://api.spoonacular.com/recipes/visualizeNutrition?apiKey=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
    })

    let HTMLres = await APIres.text();

    let root = parse(`<html>${HTMLres}</html>`);
    let header = Array.from(root.getElementsByTagName("div"))[0];

    let json = {};
    Array.from(header.childNodes).forEach((tag)=> {
        let info = tag.innerText;
        console.log("parse => " + info);
        if(info.includes(" ")){
            let name = info.slice(0, info.search(" "));
            let value = info.slice(info.search(" ")+1, info.length);
            json[`${value}`] = name;
            
        }
    });

    console.log('POST /recipe [SUCCESS]');
    res.status(200).json(json);
});

export default router;
