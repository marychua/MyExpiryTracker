//Flag indicating if Cordova is initialized
let isDeviceReady = false

// Variables for null db
let db = null;

// Variables for each item holding empty values
let item = {
    category: "",
    title: "",
    date: "",
    cycle: "",
    price: 0,
    notes: "",
    reminder1: 0,
    reminder2: "",
    color: ""
}

// File plugin error variables
const file_plugin_error = {
        1: 'Not found',
        2: 'Security',
        3: 'Abort',
        4: 'Not readable',
        5: 'Encoding',
        6: 'No modification allowed',
        7: 'Invalid state',
        8: 'Syntax',
        9: 'Invalid modification',
        10: 'Quota exceeded',
        11: 'Type mismatched',
        12: 'Path exists'
}
// Name of photo folder
const photo_folder = "Photos"

// Color label holding array of variables 
const colors = ['grey-400', 'red-300', 'blue-300', 'deep-purple-300', 'amber-500', 'light-green-300', 'deep-orange-500', 'brown-300', 'grey-800']


// Open Database
function onDeviceReady() {
    isDeviceReady = true
    console.log('Device is Ready.. Opening database..')
    console.log(navigator.vibrate);
    db = window.sqlitePlugin.openDatabase({ name: "myexpirytrackerDB.db", location: "default" },
        function dbOpenSuccess(db) {
            console.log('Database opened successfully!')
            console.log('Creating table if does not exist..')
            db.transaction(
                createTable, // Operation Callback
                function createTableError(error) { // KO Callback
                    console.log('createTableError() Error Code:', error.code)
                    console.log('createTableError() Error Code:', error.message)
                },
                function createTableSuccess() { // OK Callback
                    console.log('createTableSuccess(): Table created successfully!')
                }

            )
        },
        function dbOpenFail(error) {
            console.log('Database failed to open. Error Code:', error.code)
            console.log('Database failed to open. Message Code:', error.message)
        }
    )
}

// Create Table
function createTable(tx) {

    let sql = "CREATE TABLE IF NOT EXISTS `expiries` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,`category` TEXT,`title` TEXT,`date` TEXT,`cycle` TEXT,`price` REAL,`notes` TEXT, `reminder1` INTEGER,`reminder2` TEXT, `color` TEXT, `photo` TEXT);";

    tx.executeSql(
        sql, //SQL Statement
        [], //Arguments to SQL Statement
        function createTableTxSuccess(tx, rs) { //OK Callback
            console.log('createTableTxSuccess(): SQL Statement executed successfully!')
        },
        function createTableTxError(tx, error) { //KO Callback
            console.log('createTableTxError() Error Code:', error.code)
            console.log('createTableTxError() Message Code:', error.message)
        }
    )
    refreshList()
}

//Functions

//Clear items in form
function clearForm() {
    $('#expiry-category').val('Choose category')
    $('#expiry-title').val('')
    $('#expiry-date').val('Choose date')
    $('#expiry-cycle').val('Choose cycle')
    $('#expiry-price').val('')
    $('#expiry-notes').val('')
    $('#expiry-reminder-1').val('')
    $('#expiry-reminder-2').val('Choose duration')
    $('#color-label').val('Grey')
}
//Clear items in search menu
function clearMenu() {
    let today = new Date()
    $('#search-category').val('Choose category')
    $('#search-date').val(String(today.getDate()))
    $('#search-cycle').val('Choose cycle')
    $('#search-price').val('Choose price')
}
//Close current page to go back previous page
function backToPage() {
    
    backPage()
    refreshList()
}
//Close filter menu
function closeMenu1() {
    closeMenu('filter')
}

//========== Save Item =====================
function insertItem(tx) {
    let sql = "INSERT INTO `expiries` (`category`, `title`, `date`, `cycle`, `price`, `notes`, `reminder1`, `reminder2`, `color`, `photo`) VALUES (?,?,?,?,?,?,?,?,?,?)"
    let arguments = [
        item.category, // 1st in SQL
        item.title, // 2nd in SQL
        item.date, // 3rd in SQL
        item.cycle, // 4th in SQL
        item.price, // 5th in SQL
        item.notes, // 6th in SQL
        item.reminder1, // 7th in SQL
        item.reminder2, // 8th in SQL
        item.color, // 9th in SQL
        item.photo
    ]
    tx.executeSql(
        sql,
        arguments,
        function onInsertTxSuccess(tx, rs) {
            console.log('onInsertTxSuccess(): Item inserted successfully!')
            console.log('Item Inserted Count: ', rs.rowsAffected)
            console.log('New Item Id: ', rs.insertId)
            function alertDismissed() {
                return
            }
            navigator.notification.alert(
                'You added an expiry item.',
                alertDismissed,
                'Added',
                'Ok'
            );
            clearForm()
        },
        function onInsertTxError(tx, error) {
            console.log('onInsertTxError() Error Code:', error.code)
            console.log('onInsertTxError() Message Code:', error.message)
            function alertDismissed() {
                return
            }
            navigator.notification.alert(
                'Insert Failed (#' + error.code + ')',
                alertDismissed,
                error.message,
                'Ok'
            );
        }
    )

}

function AddItem() {

    //Check if db is null, if null then try again
    if (db === null) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Device is not ready. Please try again.',
            alertDismissed,
            'Device not ready',
            'Ok'
        );
        return
    }

    //Assign id for each field
    let category = $('#expiry-category').val() 
    let title = $('#expiry-title').val()
    let date = $('#expiry-date').val()
    let cycle = $('#expiry-cycle').val()
    let price = $('#expiry-price').val()
    let notes = $('#expiry-notes').val()
    let reminder1 = $('#expiry-reminder-1').val()
    let reminder2 = $('#expiry-reminder-2').val()
    let color = $('#color-label').val()
    let photo = $('#photo').attr('src')

    //Validate fields if empty
    if ($.trim(category) == 'Choose category') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a category.',
            alertDismissed,
            'Category Required',
            'Ok'
        );
        return
    }
    if ($.trim(title) == '') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please give a title.',
            alertDismissed,
            'Title Required',
            'Ok'
        );
        return
    }
    if ($.trim(date) == '') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a date.',
            alertDismissed,
            'Date Required',
            'Ok'
        );
        return
    }
    if ($.trim(cycle) == 'Choose cycle') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a cycle.',
            alertDismissed,
            'Cycle Required',
            'Ok'
        );
        return
    }
    if ($.trim(reminder1) == '' || !$.isNumeric(reminder1)) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please provide the number of reminder times.',
            alertDismissed,
            'Reminder Required',
            'Ok'
        );
        return
    }
    if ($.trim(reminder2) == 'Choose duration') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a duration.',
            alertDismissed,
            'Reminder Required',
            'Ok'
        );
        return
    }
    //If not empty, then store valid information, parseInt to convert to integer 
    else {
        item.category = category
        item.title = title
        item.date = date
        item.cycle = cycle
        item.price = parseInt(price)
        item.notes = notes
        item.reminder1 = parseInt(reminder1)
        item.reminder2 = reminder2
        item.color = color
        item.photo = photo
    }
    //Perform db.transaction
    db.transaction(
        insertItem,
        function onInsertError(error) {
            console.log('onInsertError() Error Code:', error.code)
            console.log('onInsertError() Message Code:', error.message)
        },
        function onInsertSuccess() {
            console.log('onInsertSuccess(): Item inserted successfully!')
        }

    )
    //Call function to refresh list by appending the new data stored in database
    refreshList()
    //Return to index page
    backToPage()
}

//======== Refresh and Show Item ==========
function refreshList() {
    if (db === null) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Database is not available',
            alertDismissed,
            'Error',
            'Ok'
        );
        return
    }

    db.transaction(
        function(tx) {
            let sql = "SELECT * FROM `expiries` ORDER BY `id` ASC"
            tx.executeSql(
                sql, [],
                function(tx, rs) {

                    $('#list').empty()

                    totalExpiry = 0

                    for (let i = 0; i < rs.rows.length; i++) {
                        totalExpiry++
                        let id = rs.rows.item(i).id
                        let title = rs.rows.item(i).title
                        let category = rs.rows.item(i).category
                        let date = rs.rows.item(i).date
                        let rowItem = i

                        let itemId = $('<p class="itemId hidden"></p>').text(id)

                        //title
                        let titleStrong = $('<strong></strong>').text(title)
                        let titleH2 = $('<h2 class="text-capital"></h2>').append(titleStrong)
                        let titleAppend = $('<div class="col"></div>').append(titleH2)

                        //category
                        let categorySpan = $('<span></span>')
                            .addClass('text-small text-white radius padding text-lowercase ' + colors[rs.rows.item(i).color])
                            .text(category)
                        let categoryAppend = $('<div class="col align-right"></div>').append(categorySpan)

                        //title and category row
                        let titleCatRow = $('<div class="row"></div>')
                            .append(titleAppend)
                            .append(categoryAppend)

                        //expires on date
                        let dateStrong = $('<strong></strong>').text(date)
                        let dateAppend = $('<p class="text-grey">Expires on </p>').append(dateStrong)

                        //Time Left 
                        let timeLeftAppend = $('<p id="countdown' + id + '" class="text-red-300 text-strong">Time Left</p>')



                        //item card
                        let item = $('<div></div>')
                            .addClass('item white mark margin-button shadow radius border-' + colors[rs.rows.item(i).color])
                            .append(itemId)
                            .append(titleCatRow)
                            .append(dateAppend)
                            .append(timeLeftAppend)
                            .on('click', function() {
                                openPage('editItem', {
                                        id: rs.rows.item(i).id,
                                        category: rs.rows.item(i).category,
                                        title: rs.rows.item(i).title,
                                        date: rs.rows.item(i).date,
                                        cycle: rs.rows.item(i).cycle,
                                        price: rs.rows.item(i).price,
                                        notes: rs.rows.item(i).notes,
                                        reminder1: rs.rows.item(i).reminder1,
                                        reminder2: rs.rows.item(i).reminder2,
                                        color: rs.rows.item(i).color,
                                        photo: rs.rows.item(i).photo,
                                                                            
                                    },

                                    function(params) {
                                        console.log(params)
                                        $('#edit-id').val(params.id)
                                        $('#edit-category').val(params.category)
                                        $('#edit-title').val(params.title)
                                        $('#edit-date').val(params.date)
                                        $('#edit-cycle').val(params.cycle)
                                        $('#edit-price').val(params.price)
                                        $('#edit-notes').val(params.notes)
                                        $('#edit-reminder-1').val(params.reminder1)
                                        $('#edit-reminder-2').val(params.reminder2)
                                        $('#edit-color-label').val(params.color)
                                        $('#edit-photo').val(params.photo)
                                        $('#edit-list').change(function () {
                                            let category = $('#edit-category').val()
                                            let title = $('#edit-title').val()
                                            let date = $('#edit-date').val()
                                            let cycle = $('#edit-cycle').val()
                                            let price = $('#edit-price').val()
                                            let notes = $('#edit-notes').val()
                                            let reminder1 = $('#edit-reminder-1').val()
                                            let reminder2 = $('#edit-reminder-2').val()
                                            ShareItem(category, title, date, cycle, price, notes, reminder1, reminder2)
                                        });
                                    },
                                    
                                )
                            })

                        $('#list').append(item)
                        countDownTimer(date, id, rowItem)
                    }
                    appendTotal()

                },
                function(tx, error) {
                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        'Failed to refresh list. Try Again.',
                        alertDismissed,
                        'Refresh Failed',
                        'Ok'
                    );
                    console.log('refreshError() Error Code: ', error.code)
                    console.log('refreshError() Error Message: ', error.message)
                }
            )
        },
        function(error) {
            console.log('refreshError() Error Code: ', error.code)
            console.log('refreshError() Error Message: ', error.message)
        },
        function() {
            console.log('Page refreshed')

        }
    )
}

function appendTotal() {
    $('#total').empty()
    let totalP = $('<p></p>')
        .addClass('text-capital textgrey1')
        .text('You have ' + totalExpiry + ' item expiries')
    $('#total').append(totalP)
    console.log('Total:' + totalExpiry)
}

PullToRefresh.init({
    mainElement: '.content',
    onRefresh: function() {
        $('#list').empty()
        $('#search-list').empty()
        setTimeout(() => { refreshList(); }, 500);

    }
});

//========== Edit Item =======================
function EditItem() {
    //Check if db is null, if null then try again
    if (db === null) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Device is not ready. Please try again.',
            alertDismissed,
            'Device Not Ready',
            'Ok'
        );
        return
    }

    //Save data into assigned id
    let category = $('#edit-category').val()
    let title = $('#edit-title').val()
    let date = $('#edit-date').val()
    let cycle = $('#edit-cycle').val()
    let price = $('#edit-price').val()
    let notes = $('#edit-notes').val()
    let reminder1 = $('#edit-reminder-1').val()
    let reminder2 = $('#edit-reminder-2').val()
    let color = $('#edit-color-label').val()
    let photo = $('#photo').attr('src')

    //Edit function validation
    if ($.trim(category) == 'Choose category') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a category.',
            alertDismissed,
            'Category Required',
            'Ok'
        );
        return
    }
    if ($.trim(title) == '') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please give a title.',
            alertDismissed,
            'Title Required',
            'Ok'
        );
        return
    }
    if ($.trim(date) == '') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a date.',
            alertDismissed,
            'Date Required',
            'Ok'
        );
        return
    }
    if ($.trim(cycle) == 'Choose cycle') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a cycle.',
            alertDismissed,
            'Cycle Required',
            'Ok'
        );
        return
    }
    if ($.trim(reminder1) == '' || !$.isNumeric(reminder1)) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please provide the number of reminder times.',
            alertDismissed,
            'Reminder Required',
            'Ok'
        );
        return
    }
    if ($.trim(reminder2) == 'Choose duration') {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please choose a duration.',
            alertDismissed,
            'Reminder Required',
            'Ok'
        );
        return
    }

    //Edit transaction
    db.transaction(
        function(tx) {
            let sql = "UPDATE `expiries` SET `category`=?,`title`=?,`date`=?,`cycle`=?,`price`=?,`notes`=?, `reminder1`=?,`reminder2`=?,`color`=?,`photo`=? WHERE `id`=?"
            let arguments = [category, title, date, cycle, price, notes, reminder1, reminder2, color, photo, $('#edit-id').val()]
            tx.executeSql(
                sql,
                arguments,
                function(tx, rs) {
                    $('#list').empty()

                    if (rs.rowsAffected == 1) {
                        function alertDismissed() {
                            return
                        }
                        navigator.notification.alert(
                            'Saved changes on item.',
                            alertDismissed,
                            'Saved Changes',
                            'Ok'
                        );
                        location.reload();
                        refreshList()
                        console.log('editTxSuccess(): Edit Success')
                    }
                },
                function(tx, error) {
                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        'Failed to edit item. Try Again.',
                        alertDismissed,
                        'Edit Failed',
                        'Ok'
                    );
                    console.log('editTxError() Error Code :', error.code)
                    console.log('editTxError() Error Message :', error.message)
                }
            )
        },
        function(error) {
            console.log('editError() Error Code :', error.code)
            console.log('editError() Error Message :', error.message)
        },
        function() {
            console.log('editSuccess(): Edit OK')
        }
    )
    backToPage()
}
//========== Delete Item =====================

function deleteConfirmation() {
    let deleteoptions = ["Delete", "Keep"];
    navigator.notification.confirm(
        "Do really you want to delete expiry item?",
        function confirmCallback(optionIndex) {
            // alert("You've selected: " + deleteoptions[optionIndex - 1])
            if (optionIndex == 1) {
                DeleteItem()
                    // Send alert when item has been deleted
                function alertDismissed() {
                    return
                }
                navigator.notification.alert(
                    'You deleted an expiry item.',
                    alertDismissed,
                    'Deleted',
                    'Ok'
                );
                navigator.notification.beep(2)

            }
            if (optionIndex == 2) {
                navigator.vibrate(3000);
                return
            }
        },
        "Delete Expiry",
        deleteoptions)
}

function DeleteItem() {
    //Check if db is null, if null then try again
    if (db === null) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Device is not ready. Please try again.',
            alertDismissed,
            'Device Not Ready',
            'Ok'
        );
        return
    }

    db.transaction(
        function(tx) {
            let sql = "DELETE FROM `expiries` WHERE `id`=?"
            let arguments = [$('#edit-id').val()]
            tx.executeSql(
                sql,
                arguments,
                function(tx, rs) {
                    if (rs.rowsAffected == 1) {
                        console.log('deleteTxSuccess(): Delete Success')
                    }
                },
                function(tx, error) {
                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        'Failed to delete item. Try Again.',
                        alertDismissed,
                        'Delete Failed',
                        'Ok'
                    );
                    console.log('deleteTxError() Error Code :', error.code)
                    console.log('deleteTxError() Error Message :', error.message)
                }
            )
        },
        function(error) {
            console.log('deleteError() Error Code :', error.code)
            console.log('deleteError() Error Message :', error.message)
        },
        function() {
            console.log('deleteSuccess(): Delete OK')
        }
    )
    refreshList()
    backToPage()
}

//========== Search Item =====================
function SearchItem() {
    let searchInput = $('#search-input').val().trim()
    let searctitle = "SELECT * FROM `expiries` WHERE `title` LIKE  '%" + searchInput + "%' or `category` LIKE  '%" + searchInput + "%'"
        //Check if db is null, if null then try again
    if (db === null) {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Device is not ready. Please try again.',
            alertDismissed,
            'Device not ready',
            'Ok'
        );
        return
    }

    if (searchInput === "") {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please key in an item.',
            alertDismissed,
            'Search Empty',
            'Ok'
        );
    }

    db.transaction(
        function(tx) {
            let sql = searctitle
            let totalRow = 0
            tx.executeSql(
                sql, [],
                function(tx, rs) {
                    $('#search-list').empty()
                    for (let i = 0; i < rs.rows.length; i++) {
                        totalRow++
                        let searchid = rs.rows.item(i).id
                        let title = rs.rows.item(i).title
                        let category = rs.rows.item(i).category
                        let searchdate = rs.rows.item(i).date
                        let searchrowitem = i

                        //id
                        let itemId = $('<p class="itemId hidden"></p>').text(searchid)

                        //title
                        let titleStrong = $('<strong></strong>').text(title)
                        let titleH2 = $('<h2 class="text-capital"></h2>').append(titleStrong)
                        let titleAppend = $('<div class="col"></div>').append(titleH2)

                        //category
                        let categorySpan = $('<span></span>')
                            .addClass('text-small text-white radius padding text-lowercase ' + colors[rs.rows.item(i).color])
                            .text(category)


                        let categoryAppend = $('<div class="col align-right"></div>').append(categorySpan)

                        //title and category row
                        let titleCatRow = $('<div class="row"></div>')
                            .append(titleAppend)
                            .append(categoryAppend)

                        //expires on date
                        let dateStrong = $('<strong class="searchDate"></strong>').text(searchdate)
                        let dateAppend = $('<p class="text-grey">Expires on </p>').append(dateStrong)

                        //days left
                        let timeLeftAppend = $('<p id="searchcountdown' + searchid + '" class="text-red-300 text-strong">Time Left</p>')

                        //item card
                        let item = $('<div></div>')
                            .addClass('item white mark margin-button shadow radius border-' + colors[rs.rows.item(i).color])
                            .append(itemId)
                            .append(titleCatRow)
                            .append(dateAppend)
                            .append(timeLeftAppend)
                            .on('click', function() {
                                openPage('editItem', {
                                        id: rs.rows.item(i).id,
                                        category: rs.rows.item(i).category,
                                        title: rs.rows.item(i).title,
                                        date: rs.rows.item(i).date,
                                        cycle: rs.rows.item(i).cycle,
                                        price: rs.rows.item(i).price,
                                        notes: rs.rows.item(i).notes,
                                        reminder1: rs.rows.item(i).reminder1,
                                        reminder2: rs.rows.item(i).reminder2,
                                        color: rs.rows.item(i).color
                                    },

                                    function(params) {
                                        console.log(params)
                                        $('#edit-id').val(params.id)
                                        $('#edit-category').val(params.category)
                                        $('#edit-title').val(params.title)
                                        $('#edit-date').val(params.date)
                                        $('#edit-cycle').val(params.cycle)
                                        $('#edit-price').val(params.price)
                                        $('#edit-notes').val(params.notes)
                                        $('#edit-reminder-1').val(params.reminder1)
                                        $('#edit-reminder-2').val(params.reminder2)
                                        $('#edit-color-label').val(params.color)
                                    })
                            })

                        searchcountDownTimer(searchdate, searchid, searchrowitem)
                        $('#search-list').append(item)
                    }

                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        totalRow + ' rows found',
                        alertDismissed,
                        'Search Results',
                        'Ok'
                    );
                    console.log(totalRow, ' Rows Found')
                    console.log('loop ended.')
                },
                function(tx, error) {
                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        'Failed to refresh list. Try Again.',
                        alertDismissed,
                        'Refresh Failed',
                        'Ok'
                    );
                    console.log('refreshError() Error Code: ', error.code)
                    console.log('refreshError() Error Message: ', error.message)
                }
            )
        },
        function(error) {
            console.log('refreshError() Error Code: ', error.code)
            console.log('refreshError() Error Message: ', error.message)
        },
        function() {
            console.log('Page refreshed')
        }
    )
}

//========== Filter Item =====================
function FilterItem() {

    let filterDate = $('#search-date').val()
    let filterCategory = $('#search-category').val()
    let filterCycle = $('#search-cycle').val()
    let filtertable = ""
    let filterInput = ""
    console.log(filterDate)
    console.log(filterCategory)



    if (filterDate == "" && filterCategory == "Choose category" && filterCycle == "Choose cycle") {
        function alertDismissed() {
            return
        }
        navigator.notification.alert(
            'Please filter an item.',
            alertDismissed,
            'Filter Empty',
            'Ok'
        );
        return
    }
    if (filterDate !== "") {
        filtertable = "date"
        filterInput = filterDate
    }
    if (filterCategory !== "Choose category") {
        filtertable = "category"
        filterInput = filterCategory
    }
    if (filterCycle !== "Choose cycle") {
        filtertable = "cycle"
        filterInput = filterCycle
    }
    console.log(filterInput)
    console.log(filtertable)
    db.transaction(
        function(tx) {
            console.log('inside transaction..')
            let sql = 'SELECT * FROM `expiries` WHERE `' + filtertable + '` = "' + filterInput + '"'
            let totalRow = 0
            tx.executeSql(
                sql, [],
                function(tx, rs) {

                    $('#search-list').empty()
                    for (let i = 0; i < rs.rows.length; i++) {
                        totalRow++
                        let searchid = rs.rows.item(i).id
                        let title = rs.rows.item(i).title
                        let category = rs.rows.item(i).category
                        let searchdate = rs.rows.item(i).date

                        let itemId = $('<p class="hidden"></p>').text(searchid)
                            //title
                        let titleStrong = $('<strong></strong>').text(title)
                        let titleH2 = $('<h2 class="text-capital"></h2>').append(titleStrong)
                        let titleAppend = $('<div class="col"></div>').append(titleH2)
                        let searchrowitem = i

                        //category
                        let categorySpan = $('<span></span>')
                            .addClass('text-small text-white radius padding text-lowercase ' + colors[rs.rows.item(i).color])
                            .text(category)


                        let categoryAppend = $('<div class="col align-right"></div>').append(categorySpan)

                        //title and category row
                        let titleCatRow = $('<div class="row"></div>')
                            .append(titleAppend)
                            .append(categoryAppend)

                        //expires on date
                        let dateStrong = $('<strong></strong>').text(searchdate)
                        let dateAppend = $('<p class="text-grey">Expires on </p>').append(dateStrong)

                        //days left
                        let timeLeftAppend = $('<p id="searchcountdown' + searchid + '" class="text-red-300 text-strong">Time Left</p>')

                        //item card
                        let item = $('<div></div>')
                            .addClass('item white mark margin-button shadow radius border-' + colors[rs.rows.item(i).color]) //+colors[rs.rows.item(i).color]
                            .append(itemId)
                            .append(titleCatRow)
                            .append(dateAppend)
                            .append(timeLeftAppend)
                            .on('click', function() {
                                openPage('editItem', {
                                        id: rs.rows.item(i).id,
                                        category: rs.rows.item(i).category,
                                        title: rs.rows.item(i).title,
                                        date: rs.rows.item(i).date,
                                        cycle: rs.rows.item(i).cycle,
                                        price: rs.rows.item(i).price,
                                        notes: rs.rows.item(i).notes,
                                        reminder1: rs.rows.item(i).reminder1,
                                        reminder2: rs.rows.item(i).reminder2,
                                        color: rs.rows.item(i).color
                                    },

                                    function(params) {
                                        console.log(params)
                                        $('#edit-id').val(params.id)
                                        $('#edit-category').val(params.category)
                                        $('#edit-title').val(params.title)
                                        $('#edit-date').val(params.date)
                                        $('#edit-cycle').val(params.cycle)
                                        $('#edit-price').val(params.price)
                                        $('#edit-notes').val(params.notes)
                                        $('#edit-reminder-1').val(params.reminder1)
                                        $('#edit-reminder-2').val(params.reminder2)
                                        $('#edit-color-label').val(params.color)
                                    })
                            })

                        searchcountDownTimer(searchdate, searchid, searchrowitem)
                        $('#search-list').append(item)
                        console.log(timeLeftAppend)


                    }

                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        totalRow + ' rows found',
                        alertDismissed,
                        'Filter Results',
                        'Ok'
                    );
                    console.log(totalRow, ' Rows Found')

                },
                function(tx, error) {
                    function alertDismissed() {
                        return
                    }
                    navigator.notification.alert(
                        'Failed to refresh list. Try Again.',
                        alertDismissed,
                        'Refresh Failed',
                        'Ok'
                    );
                    console.log('refreshError() Error Code: ', error.code)
                    console.log('refreshError() Error Message: ', error.message)
                }
            )
        },
        function(error) {
            console.log('refreshError() Error Code: ', error.code)
            console.log('refreshError() Error Message: ', error.message)
        },
        function() {
            console.log('Page refreshed')
            closeMenu1()
        }
    )
}

//========== Share Function in editItem.html =====================
//https://www.npmjs.com/package/fitatu-cordova-plugin-x-socialsharing#3-installation
function ShareItem(category, title, date, cycle, price, notes, reminder1, reminder2) {
    let myMessage = 'Hi, just wanted to share with you my latest expiry item: \n Category: ' + category + '\n Title: ' + title + '\n Date: ' + date + '\n Cycle: ' + cycle + '\n Price: ' + price + '\n Notes: ' + notes + '\n Reminder: ' + reminder1 + ' per ' + reminder2
    var options = {
        message: myMessage, // Email message
        subject: 'Sharing My Expiry Item', // Email subject
        files: ['', ''], // An array of filenames
        url: 'https://cordova.apache.org/docs/en/10.x/guide/cli/index.html', // Link to expiry item details
        chooserTitle: 'Share Your Expiry Item' // Title when displaying options panel
    }

    // Success Callback
    var onSuccess = function(result) {
        console.log("Share completed? " + result.completed);
        console.log("Shared to app: " + result.app);
    }
    // Error Callback
    var onError = function(msg) {
        console.log("Sharing failed with message: " + msg);
    }

    $(document).ready(function () {
        $("#share-btn").click(function () {
            window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
            window.plugins.socialsharing.share(message, subject)
        });
    });
}

//========== Photo Function in addItem.html and editItem.html =====================
function takePhoto() {
    navigator.camera.getPicture(
        function(photoUri) {
            let img = $('#photo').attr('src')
            console.log('Photo Uri: ', photoUri)
            $('#photo').attr('src', photoUri)
            $('#clearPhotoBtn')
                .removeClass('hidden')
                .addClass('visible')

            function alertDismissed() {
                return
            }
            navigator.notification.alert(
                'You uploaded a photo : ' + img,
                alertDismissed,
                'Upload Photo',
                'Ok'
            );
            console.log('photo uploaded')
        },
        function(error) {
            function alertDismissed() {
                return
            }
            navigator.notification.alert(
                error,
                alertDismissed,
                'Photo Upload Failed',
                'Ok'
            );
            console.log(errors)
        }, {
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            quality: 100,
            targetWidth: 500,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true,
            destinationType: Camera.DestinationType.FILE_URI

        }
    )
}

function clearPhoto() {
    let rmPhotoOptions = ["Remove", "Keep"];
    navigator.notification.confirm(
        "Do really you want to remove photo?",
        function rmConfirmCallback(optionIndex) {
            if (optionIndex == 1) {
                $('#photo').attr('src', 'img/camera-placeholder.jpg')
                $('#clearPhotoBtn')
                    .removeClass('visible')
                    .addClass('hidden')
                navigator.notification.beep(2)
            }
            if (optionIndex == 2) {
                navigator.vibrate(3000);
                return
            }
        },
        "Remove Photo",
        rmPhotoOptions
    )
}
//Countdown
//https://www.w3schools.com/howto/howto_js_countdown.asp
let countDownTimer = function(date, id, rowItem) {

    if (rowItem >= 0) {
        let countDownDate = new Date(date + " 24:00:00").getTime();
        console.log(countDownDate)
        let x = setInterval(function() {

            // Get today's date and time
            let now = new Date().getTime();

            // Find the distance between now and the count down date
            let distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="countdown"

            document.getElementById("countdown" + id).innerHTML = days + " day(s) left";
            // + hours + "hour &nbsp" + minutes + "min &nbsp"  + seconds + " sec &nbsp"   

            // If the count down is over, write some text
            if (distance < 0) {
                clearInterval(x);
                document.getElementById("countdown" + id).innerHTML = "EXPIRED";
            }
        }, 1000);
    }
    if (rowItem < 0) {
        return
    }
}
let searchcountDownTimer = function(searchdate, searchid, searchrowitem) {
    if (searchrowitem >= 0) {
        let countDownDate = new Date(searchdate + " 24:00:00").getTime();
        console.log(countDownDate)
        let x = setInterval(function() {

            // Get today's date and time
            let now = new Date().getTime();

            // Find the distance between now and the count down date
            let distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="searchcountdown"
            document.getElementById("searchcountdown" + searchid).innerHTML = days + " day(s) left";
            // + hours + "hour &nbsp" + minutes + "min &nbsp"  + seconds + " sec &nbsp"

            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                document.getElementById("searchcountdown" + searchid).innerHTML = "EXPIRED";
            }
        }, 1000);
    }
    if (searchrowitem < 0) {
        return
    }

}






// 'deviceready' event to listener 
$(document).on('deviceready', onDeviceReady)