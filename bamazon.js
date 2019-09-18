//requiring 
const mysql = require('mysql');
const inquirer = require('inquirer');
//establishing connection to our SQL workbench database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ldv5841827',
    database: 'bamazon'

});
//giving costumer an exit 
const checkIFExit = (choice) => {
    if(choice === "q"){
        console.log("Goodbye");
        process.exit(0);
    }
}
//checking inventory
const checkInventory = (itemID, inventory) => {
    for(let index = 0; index < inventory.length; index++){
        if(inventory[index].item_id === itemID){
            return inventory[index];
        }
    }
    return null
}
//Updating Database after completing purchase
const  makePurchase = (product, quantity) => {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantity, product.item_id], function(err, res) {
        if(err) throw err;
        console.log("Successfully purchased " + quantity +"," + product.product_name);
    })
}
//prompt to ask the costumer how many items will they be needing, and check if enough stock is available 
const promptCustomerForQuantity = (product) => {
    inquirer.prompt([{
        type: "input",
        name: "quantity",
        message: "How many consoles would you like to purchase?[Quit with Q]",
        validate: function(val){
            return val > 0 || val.toLowerCase() === 'q'
        } 
//if not enough stock availble , we will let the costumer know.
    }]).then(function(val) {
        checkIFExit(val.quantity);
        let quantity = parseInt(val.quantity);

        if(quantity > product.stock_quantity){
            console.log("Insufficient quantity");
            loadProduct();
        } else {
            makePurchase(product, quantity)
        }


    })
}

//prompt to ask the costumer what item they will to buy, and check if item is available
const promptCustomer = (inventory) => {
    inquirer.prompt([
        {
            type: "input",
            name: "choice",
            message: "What is the ID of the item you like to purchase? [Quit with Q]",
            validate: function(val){
                return !isNaN(val) || val.toLowerCase() === 'q'
            }
        }
 //if product not available, we let the costumer know
    ]).then(function(val) {
        checkIFExit(val.choice);
        let itemID = parseInt(val.choice);
        let product = checkInventory(itemID, inventory)
        console.log(product)
        if(product){
            promptCustomerForQuantity(product);
        } else {
            console.log("\nThat item is not in the inventory");
            loadProduct();
        }
    })
}

//We load our products from our database
const loadProduct = () => {
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        console.table(res);
        promptCustomer(res)
    } )
}
//in case connection isn't established
connection.connect(function(err){
    if(err) throw err;
    loadProduct();
})