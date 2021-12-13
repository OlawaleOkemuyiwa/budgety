//EACH OF THE MODULES(BudgetController, UIcontroller, and App controller) are basically objects. They are objects because they're assigned to an immediately invoked function declaration which returns an object consisting of different methods and properties. This returned object is then copied into budgetController, UIcontroller, and controller global variables which makes the variables(object) accessible everywhere in our code. (well they're not technically copied into the variables as objects are reference types so the variables are just pointers/references to the object sitting in memory).I CONSOLED LOG the 2 variables(objects) to show this. The reason this was done is to group the different functionalities of the app into 3 sections: the database(budget controller), the UI (UI controller) and the app controller while creating a function scope for each sections.Its basically creating modules for each section in the same single file but we have ES6now  modules where we can import and export funcs, variables etc so this method is quite archaic now. 

//Modules help us to write code in them and expose(by the means of export) only those parts of the code that should be accessed or needed by other modules. So basically we "exported" all the methods (functions) from BudgetController and UIcontroller modules and in the app contoller, we imported them as budgetCtrl and UIctrl objects respectively (similar to import *). To use ES6 modules, we dont need webpack anymore. We only need to add the attribute type="module" to the main js file linked to the html.


//The whole idea of this app is that data is gonna be inputed for the type, description, and value(price) of an item be the item an expense or an income. The data is then used to create an object for the item (from an Income constructor or an Expense constructor depending on the type of the item) and they properties of the item object would be these inputted data(description, value)and a unique ID as well as computational methods if need be (e.g for calculations of individual percentage of an expense item on the total Income). This object is then pushed to the data structure [more item objects (either income item or expense item) are created and pushed to the data structure as more items are added i.e. inputted by the user] and these objects data are then used in diff calculations e.g calculate budget, calculate percentages etc. The parsed values from these operations are then displayed on the UI when needed.

//whenever an element(s) is inserted into the DOM by us (insertAdjacentHTML) we must endeavor to add a unique number as its ID so we can be able to identify and pinpoint it whenever need be. 


//BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;  //when sth is not yet defined(i.e the calculation here hasnt been performed) we use -1
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0 ) {
            this.percentage = Math.round((this.value / totalIncome) * 100);   
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
    };
    
    var Income = function(id, description, value) {
        this.id = id; 
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0  
        },
        budget: 0,
        percentage: -1 // -1 is used so as to show the value of percentage didnt exist before the total inc and total exp were calculated n divided
    };
    
    
    function calculateTotal(type) { //calc sum of all incomes and all expenses and stores the diff values into the data structure
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value; 
        });
        
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {   //(input.type, input.description, input.value) 
        //addItem func pushes/saves newItems objects into the data structure at the same time, returns the value of the newItem object just created in it, which is saved and used as newitemUI in app controller 
            var newItem, ID;
            
            //Create new ID by adding 1 to the previous ID
            if (data.allItems[type].length > 0) {
                //ID of new added item = the ID of last item added + 1;
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //.length-1 is the index of the last element in an array 
            } else {
                ID = 0; //ID will always be = 0 for the first elements then
            }
            
            //Create new Item by passing the arguments of this function into d function constructor 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //Push into our data structure (that is exp/inc array)
            data.allItems[type].push(newItem);
            
            return newItem;       
        },
        
        calculateBudget: function() { //calculates tot inc - tot exp and also the percentage of total expense to the total income and stores the values of the budget into the data structure 
            
            // Calculate both the total income and total expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: total income - total expense
            data.budget =  data.totals.inc - data.totals.exp;
                
            // Calculate the percentage of income spent ; % of total income thats the expense 
            if (data.totals.inc > 0 && data.totals.inc > data.totals.exp) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); //.round --> rounds decimals to d nearest integer
            } else {
                data.percentage = -1;
            } 
                
        },
        
        getBudget: function() { //will be passed in the UI controller displayBudget Func
           return {
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage
           };
        },
        
        calculatePercentages: function() { //a calcPercentage method is created in the prototype property of the expense constructor and is inherited by all expense items created with this construction i.e the instances of the Expense constructor.
            
            data.allItems.exp.forEach(function(current) { //the method is called for all exp items in d exp arry to execute their calcPercentage method 
               current.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentages: function() { // like forEach but map returns an array and we store it in the allPerc variable.
            var allPerc = data.allItems.exp.map(function(current) {
               return current.getPercentage(); //exp.getPercentage() returns the percentage of that exp item, this value is then returned into the map array;
            });
            
            return allPerc; //return array of percentages when the function is invoked/called
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // e.g ids = [1 2 4 6 8] are the new ids present after some of the initial id has been deleted gotten through current.id map function
            
            ids = data.allItems[type].map(function(current) { //map method loops over the income or expense array and returns a brand new array of all ids that are present at that time which will have the same length as the array it was used on
                
               return current.id; //id here is not the argument id
            });
            
            index = ids.indexOf(id); //the index of the id selected amongst the others in the newly created ids array
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);  //splice is an array method used to mutate an array based on(the index no of the element we wish to start deleting from, no of elements to remove, new elements to be added based on starting index(optional))
                //e.g [1, 2, 3, 4, 5,6].splice(2, 3, 7, 8) = [1, 2, 7, 8, 6]
            }
        }
    };

})();
console.log(budgetController);

//UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        date: '.budget__title--month'
    };
    
    var formatNumber =  function(num, type) {
            var numSplit, int, dec, sign;
            /*
            + or - before the number 
            exactly 2 decimal points 
            comma seperating the thousands 
            e.g
            2300.5467 --> + 2,300.55
            200 --> + 200.00
            */
            
            num = Math.abs(num);  //To remove + or - value if the num be pass in has one (i.e -2300 to 2300 0r +40 to 40)
            num = num.toFixed(2);  //a number method that rounds the decimal points of a number to 2 and if it has no decimal adds 2 zeros (.00) to such number and returns the number now as a string
            
            numSplit = num.split('.'); //splits num by . and returns an array of integer and decimal sides seperated(both are strings here) 
            
            int = numSplit[0];   // The integer side of the number which is now a string 
            dec = numSplit[1];   // The decimal side of the number which is also now a string 
            
            if (int.length > 3) { //strings also have access to .length property, it gives the no of characters in a string
                int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`; //substring is a string method used to copy a section of the characters in a string(starting index, no of characters we  want)
            } 
        
            //!!!WRITE CODE FOR WHEN THE INT.length > 6 also
        
            sign = type === 'exp' ? '-' : '+';
            
            return `${sign} ${int}.${dec}`
    };
    
    return {
        DOMstrings,
        
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,    //Which will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) { //obj is the newItem(either an incomeor expense obj) just created and stored in the data structure, type == input.type
            
            //use to replace id, des, value in the string we are to insert in the DOM with the id, description and value of newItem just created  
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);           //replace the initial id in the string with the id of the new inputed object 
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type)); 
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); //insert a string with a replaced id, description and value into the income or expense container(they contain the items created), before the end of the container
        },
         
        clearFields: function() { 
            var fields;
            
            fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`); 
            
            fields.forEach(function(cur) { //forEach helps to loop over an array all at once and it allows C,I,A arguments
               cur.value = '';  //Clear the description and value inputed texts/value
            });
            
            fields[0].focus(); // To bring the focus back to description in the nodeList[0]
        },
        
        displayBudget: function(obj) { //this obj here is the obj inwhich the budget, total income, total expenses, and % is stored
            var type;
            
            type = obj.budget >= 0 ? 'inc' : 'exp'; //'inc' and 'exp' here is used to represent if a number would get the + sign or - sign in the format function. If budget is above 0 then it gets the + sign('inc'), if below 0 then it gets -('exp')
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0 ) { //since percentage can only be calculated and stored if (inc>0 && inc>exp) or -1 if these conditions arent met. Only display    
                document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";   
            }
        },
        
        displayPercentages: function(percentages) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //This returns a nodeList of all selected items percentage elements

            fields.forEach(function(current, index) { //loop over each item percentage node using both each element and its index values 
                if (percentages[index] > 0 && percentages[index] <= 100) {
                    current.textContent = `${percentages[index]}%`;  
                } else {
                    current.textContent = '---';
                }   
            })

        },
        
        deleteListItem: function(selectorID) {
           var el = document.getElementById(selectorID);
            
            el.parentElement.removeChild(el); //in JS u cant just delete an element, you have to go up to the parent of such element then remove the child of the parent(which is the element we wish to remove)
        },
        
        changedType: function() { //change the color of fields based on the type(+ or -) choosen
            var fields, fieldsArr;
            fields = document.querySelectorAll(`${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);
            
            fields.forEach(function(current) {
                current.classList.toggle('red-focus'); //if 'red-focus' class is absent then add it there, if present then remove it
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },

        displayDate: function() {
            var now, date, month, months, year;
            
            now = new Date();  //Date is a constructor which has methods used to get the present date in its prototype property which is the prototype of it's instances. So the instances have access to these methods.
            
            date = now.getDate(); //returns present date e.g 3, 11, 24 
            
            month = now.getMonth(); //returns the index of the present month i.e. January == 0, Febuary == 1, March == 2...
            
            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            
            year = now.getFullYear();  //returns present year
            
            document.querySelector(DOMstrings.date).textContent = `${months[month]} ${date} ${year}`; 
        }
    };
    
})();
console.log(UIController);


//BC === 3 - 150, UI === 153 - 326
//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.DOMstrings;
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        //document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //The old way: the listener was added to the container cause its the parent element of all the incomes and expenses, so we want to perform event delegation on the whole container.
        
        [DOM.incomeContainer, DOM.expensesContainer].forEach(el => {
            document.querySelector(el).addEventListener('click', ctrlDeleteItem);
        }); //New way: do the event delegation on each income and expenses container individually
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    function ctrlAddItem() {  
        var input, newItemUI;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        if (input.description.trim() !== '' && !isNaN(input.value) && input.value > 0) { 
            // 2. Add the item to the budget controller
            newItemUI = budgetCtrl.addItem(input.type, input.description, input.value); //the addItem public receives the input values, creates a new instance(object) of either the Income or Expense constructor based on the type value, pushes the obj into the data structure and returns the newly created item obj({id, description, value, (percentage)})

            // 3. Add the item to the UI
            UICtrl.addListItem(newItemUI, input.type);

            // 4. Clear the fields
            UICtrl.clearFields(); //clear input fields and bring focus back to the description input

            // 5. Calculate and Update/display budget
            updateBudget();
            
            // 6. Calculate and update/display percentages of each expenses item
            updatePercentages();
        }   
    };

    function updateBudget() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget(); //calls the func so the calculations will be executed 
        
        // 2. Return the budget 
        var budget = budgetCtrl.getBudget(); //stores the obj consisting of budget,total inc, total exp, and percentage 
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    function updatePercentages() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages(); //An array of percentages calculated
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    function ctrlDeleteItem(event) {
        var itemID, splitID, type, ID;
        
        //OLD METHOD 
        //itemID = event.target.parentElement.parentElement.parentElement.parentElement.id;
        //event.target === the element which triggers the event. It returns the node element e.g<h1 class="heading"> book </h2> on which the click happened(During event delegation it is used to identify the element that triggered the event which bubbled up to the containing parent element on which the event listener was added). We then transverse up that element to its parent through the 'parentNode' method, the id of such parent element is retrieved and stored in itemID variable i.e inc-0, inc-1, exp-0, exp-1 e.t.c also, only that parent element has an id, so when we click on others, this doesnt happen for other clicked element has none has a greatgrand parent with the id attribute
        //event.currentTarget === the element in which the event listener is attached to. it will always return that same one element
        
        //NEW BETTER METHOD
        //closest() tranverses up the event.target element to its parent and ancestor elements till it finds the nearest element that matches the provided selector string. We wish to select only the .item element for the purpose of deleting it, but this can only be achieved by clicking on its child element delete button
        //This works cause event delegation was done directly on the income__list, expenses__list containing elements each as shown in setEventListeners function instead of doing it on the container element which contains other redundant elements e.g h1 which we dont really need in the delegation. This is beacause for example the h1 element in the container can be the event.target element if the delegation element is the container and event.target.closet('.item') would return null for this because neither itself nor any of its ancestor element matches the .item element. This is unwanted.
        
        itemID = event.target.closest('.item').id;
        
        if (itemID) {
            splitID = itemID.split('-'); //Splits the string 'i.e inc-0' to an array ["inc", "0"]
            type = splitID[0];
            ID = parseInt(splitID[1]); //converts number in a string i.e "0" or "0.8" to just a number 0
            
        // 1. Delete the item from the data structure 
            budgetCtrl.deleteItem(type, ID);
            
        // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
        // 3. Update and show the new budget   
            updateBudget();
            
        // 4. Calculate and update percentages of each expense item
            updatePercentages();

        }
    };
    
    return {
        init: function() {
            UICtrl.displayBudget({ //directly sets all the values in budget object as 0 on load
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
            setupEventListeners(); //we wish to set the eveent listeners immediately we load the page
            UICtrl.displayDate();
        }
    };
    
})(budgetController, UIController); 
controller.init();
//BC === 3 - 150, UI === 153 - 326
//Both the budgetController and UIController objects are accessible in the IIFE attached to the controller object because they are in a global variable so they can simply be used in the function as budgetController.sth() but we wish to give the function its independence so we pass the objects as arguments to the func and now they're represented by local variables budgetCtrl and UICtrl in the function. Now when the variable name of the objects "budgetController" "UIController" are changed for whatever reason we only need to reflect such change to the argument passed into the controller IIFE instead of having to change the variable names everwhere they're used in the function block. 
