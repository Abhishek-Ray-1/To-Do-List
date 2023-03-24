const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
//const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const uri = "mongodb+srv://admin-Abhishek:Test123@cluster0.g7znb89.mongodb.net/";

//Connection
mongoose.connect(uri + "todolistDB" , {useNewUrlParser: true});

//Schema
const itemsSchema = new mongoose.Schema({
  name : String
});

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

//Model
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listsSchema);


const item1 = new Item({
  name: "Wecome to To Do List"
});

const item2 = new Item({
  name: "Press + to add new item"
});

const defaultItems = [item1 , item2]; 

//console.log(defaultItem);
//Item.insertMany(defaultItem);
//const items = ["Start Working"];
//const workItems = [];

//GET Routes

app.get("/", function (req, res) {

  //const day = date.getDate();
  Item.find({}).then(function(foundItems) {
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else
    {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function(foundList) {
    if(!foundList)
    {
      const list = new List({
        name : customListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else
    {
      res.render("list", { listTitle: customListName, newListItems: foundList.items });
    }
  });

});

app.get("/about", function (req, res) {
  res.render("about");
});



//POST Routes

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name : itemName
  });
  
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete" , function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId).then(function(){
      res.redirect("/");
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}}).then(function(doc){
      if(doc)
      {
        res.redirect("/" + listName);
      }
    });

  }
  
});


app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
