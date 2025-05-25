//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is the Item Management page, where the admin can add, edit or delete items
//Last modified: 11/03/2024
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import './admin.css';

const ItemManagement = () => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    };

    const [itemList, setItemList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(false); // Loading state
    const itemsPerPage = 15; // Number of items per page
    let limit = 1000; // Number of items to fetch

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [currentItemID, setCurrentItemID] = useState(null);
    const [itemName, setItemName] = useState("");
    const [itemAuthor, setItemAuthor] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemGenre, setItemGenre] = useState("");
    const [itemSubGenre, setItemSubGenre] = useState("");
    const [PublishedDate, setPublishedDate] = useState("");
    const [itemSourceID, setItemSourceID] = useState("");
    const userID = useSelector((state) => state.auth.user);
    
    // Fetch the list of items from the Stocktake table
    const fetchItemList = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake?limit=${limit}`, { headers: headers });
            console.log("Axios response: ", response);
            setItemList(response.data.list);
        } catch (error) {
            console.error("Error fetching item list: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch the product from Product table for a given ProductId
    const fetchProductTable = async (ProductId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Product/${ProductId}`, { headers: headers });
            console.log("Axios response: ", response);
            setProduct(response.data);
            setItemAuthor(response.data.Author);
            console.log("Product: ", product);
        } catch (error) {   
            console.error("Error fetching product table: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemList();
    }, [])

    // Pagination change handler
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = itemList.slice(indexOfFirstItem, indexOfLastItem);

    const handleAddItem = (id) => {

        console.log(`Add Item button clicked for item ${id}`);
        setItemName("");
        setItemAuthor("");
        setItemPrice("");
        setItemQuantity("");
        setItemGenre("");
        setItemDescription("");
        setItemSubGenre("");
        setPublishedDate("");
        setItemSourceID("");
        setOpenAddDialog(true);
    };

    const handleEditItem = (id) => {
        console.log(`Edit Customer button clicked for item ${id}`);
        const item = itemList.find((item) => item.ItemId === id);
        if(item) {
            setCurrentItemID(item.ItemId);
            setItemName(item.Product.Name);
            setItemPrice(item.Price);
            setItemQuantity(item.Quantity);
            
            fetchProductTable(item.ProductId);
            setOpenEditDialog(true);
        }
    };

    const handleDeleteItem = (id) => {
        console.log(`Delete Customer button clicked for Item ${id}`);
        const item = itemList.find((item) => item.ItemId === id);
        setCurrentItemID(item.ItemId);
        setItemName(item.Product.Name);
        setOpenDeleteDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setItemName("");
        setItemAuthor("");
        setItemPrice("");
        setItemQuantity("");
        setItemDescription("");
        setItemGenre("");
        setItemSubGenre("");
        setPublishedDate("");
        setItemSourceID("");
        setQuantityError("");
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setCurrentItemID(null);
        setProduct({});
        setItemName("");
        setItemAuthor("");
        setItemPrice("");
        setItemQuantity("");
        setQuantityError("");
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setCurrentItemID(null);
        setItemName("");
    };

    async function handleAddItemSubmit(event) {
        event.preventDefault();

        // create last updated date
        const lastUpdated = new Date().toISOString();
    
        // Create new item objects for Stocktake and Product tables
        let newItemStocktake = {
            "Price": itemPrice,
            "Quantity": itemQuantity,
            "SourceId": itemSourceID,
        };
    
        let newItemProduct = {
            "Name": itemName,
            "Author": itemAuthor,
            "Description": itemDescription,
            "Genre": itemGenre,
            "SubGenre": itemSubGenre,
            "PublishedDate": PublishedDate,
            "LastUpdated": lastUpdated,
            "Published": lastUpdated,
            "LastUpdatedBy": userID
        };
    
        try {
            // First, add the new product
            const productResponse = await axios.post(`http://localhost:8080/api/v1/db/data/v1/inft3050/Product`, newItemProduct, { headers: headers });
            const newProductId = productResponse.data.ID;
    
            // Then, add the new stocktake item with the new product ID
            newItemStocktake.ProductId = newProductId;
            await axios.post(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake`, newItemStocktake, { headers: headers });
    
            fetchItemList();
            limit += 1;
            setOpenAddDialog(false);
        } catch (error) {
            console.error("Error adding new item: ", error);
        }
    };

    async function handleEditItemSubmit(event) {
        event.preventDefault();
        
        let itemNewInfoStocktake = {
            "Price": itemPrice,
            "Quantity": itemQuantity
        };

        let itemNewInfoProduct = {
            "Name": itemName,
            "Author": itemAuthor
        };
        
        // Update the item in the Stocktake and Product tables
        try {
            await axios.patch(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/${currentItemID}`, itemNewInfoStocktake, { headers: headers });
            
            await axios.patch(`http://localhost:8080/api/v1/db/data/v1/inft3050/Product/${product.ID}`, itemNewInfoProduct, { headers: headers });
            
            fetchItemList();
            setOpenEditDialog(false);
        } catch (error) {
            console.error("Error updating item: ", error);
        }
        
        handleCloseEditDialog();
}

const handleDeleteItemSubmit = async () => {
    try {
        // Fetch the ProductId associated with the item
        const stocktakeResponse = await axios.get(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/${currentItemID}`, { headers: headers });
        const productId = stocktakeResponse.data.ProductId;

        // Delete the item from the Stocktake table
        await axios.delete(`http://localhost:8080/api/v1/db/data/v1/inft3050/Stocktake/${currentItemID}`, { headers: headers });

        // Delete the item from the Product table
        await axios.delete(`http://localhost:8080/api/v1/db/data/v1/inft3050/Product/${productId}`, { headers: headers });

        // Refresh the item list
        fetchItemList();
    } catch (error) {
        console.error("Error deleting item: ", error);
    }
    handleCloseDeleteDialog();
};
const handleGenreChange = (event) => {
    setItemGenre(event.target.value);
    setItemSubGenre(""); // Reset subgenre when genre changes
};

const handleSubGenreChange = (event) => {
    setItemSubGenre(event.target.value);
};

const handleSourceChange = (event) => {
    setItemSourceID(event.target.value);
};

const handleQuantityChange = (event) => {
    setItemQuantity(event.target.value);
    if (Number(event.target.value) <= 0) {
        setQuantityError("Invalid quantity");
    } else {
        setQuantityError("");
    }
};

// Sub-genres for each genre
const subGenres = {
    1: [
        { SubGenreID: 1, Name: "Fiction" },
        { SubGenreID: 2, Name: "Historical Fiction" },
        { SubGenreID: 3, Name: "Fantasy/Sci-Fi" },
        { SubGenreID: 4, Name: "Young Adult" },
        { SubGenreID: 5, Name: "Humour" },
        { SubGenreID: 6, Name: "Crime" },
        { SubGenreID: 7, Name: "Mystery" },
        { SubGenreID: 8, Name: "Romance" },
        { SubGenreID: 9, Name: "Thriller" }
    ],
    2: [
        { SubGenreID: 1, Name: "Drama" },
        { SubGenreID: 2, Name: "Comedy" },
        { SubGenreID: 3, Name: "Crime" },
        { SubGenreID: 4, Name: "Action" },
        { SubGenreID: 5, Name: "Horror" },
        { SubGenreID: 6, Name: "Family" },
        { SubGenreID: 7, Name: "Western" },
        { SubGenreID: 8, Name: "Documentary" }
    ],
    3: [
        { SubGenreID: 1, Name: "RPG" },
        { SubGenreID: 2, Name: "Musical game" },
        { SubGenreID: 3, Name: "Puzzle game" },
        { SubGenreID: 4, Name: "Strategy" },
        { SubGenreID: 5, Name: "Platform" },
        { SubGenreID: 6, Name: "Action-adventure" },
        { SubGenreID: 7, Name: "Racing" },
        { SubGenreID: 8, Name: "Stealth" },
        { SubGenreID: 9, Name: "MMORPG" },
        { SubGenreID: 10, Name: "Survival" },
        { SubGenreID: 11, Name: "Simulation" },
        { SubGenreID: 12, Name: "Sports" },
        { SubGenreID: 13, Name: "First-person shooter" },
        { SubGenreID: 14, Name: "Fighting" }
    ]
};

// Sources for each genre
const sources = {
    1: [
        { Sourceid: 1, SourceName: "Hard copy book" },
        { Sourceid: 2, SourceName: "Audible" }
    ],
    2: [
        { Sourceid: 4, SourceName: "Prime Video" },
        { Sourceid: 5, SourceName: "DVD" },
        { Sourceid: 6, SourceName: "VHS" }
    ],
    3: [
        { Sourceid: 3, SourceName: "Steam" },
        { Sourceid: 8, SourceName: "Hard copy game" }
    ]
};

    return (
        <div className='mainBodyAdminFunction'>
            <h1>Item Management</h1>
            <Button variant="contained" color="primary" onClick={handleAddItem}>
                Add Item
            </Button>
            <div>
            {loading ? (  
                <CircularProgress />
            ) : (
                <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentItems.map((item) => (
                            <TableRow key={item.ItemId}>
                                <TableCell>{item.ItemId}</TableCell>
                                <TableCell>{item.Product.Name}</TableCell>
                                <TableCell>{item.Source.SourceName}</TableCell>
                                <TableCell>{item.Quantity}</TableCell>
                                <TableCell>${item.Price}</TableCell>
                                <TableCell>
                                    <Button variant="contained" style={{ backgroundColor: '#3A83BB' }} onClick={() => handleEditItem(item.ItemId)}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" color="error" onClick={() => handleDeleteItem(item.ItemId)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(itemList.length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
            />
            {/* Add Item Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                <DialogTitle>Add Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details for the new item below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Item Name"
                        type="text"
                        fullWidth
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Item Author"
                        type="text"
                        fullWidth
                        value={itemAuthor}
                        onChange={(e) => setItemAuthor(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Item Description"
                        type="text"
                        fullWidth
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Item Quantity"
                        type="number"
                        fullWidth
                        value={itemQuantity}
                        onChange={handleQuantityChange}
                        error={!!quantityError}
                        helperText={quantityError}
                    />
                    <TextField
                        margin="dense"
                        label="Item Price"
                        type="number"
                        fullWidth
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Item Genre</InputLabel>
                        <Select
                            value={itemGenre}
                            onChange={handleGenreChange}
                        >
                            <MenuItem value={1}>Books</MenuItem>
                            <MenuItem value={2}>Movies</MenuItem>
                            <MenuItem value={3}>Games</MenuItem>
                        </Select>
                    </FormControl>
                    {itemGenre && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Item SubGenre</InputLabel>
                            <Select
                                value={itemSubGenre}
                                onChange={handleSubGenreChange}
                            >
                                {subGenres[itemGenre].map((subGenre) => (
                                    <MenuItem key={subGenre.SubGenreID} value={subGenre.SubGenreID}>
                                        {subGenre.Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {itemGenre && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Item Source</InputLabel>
                            <Select
                                value={itemSourceID}
                                onChange={handleSourceChange}
                            >
                                {sources[itemGenre].map((source) => (
                                    <MenuItem key={source.Sourceid} value={source.Sourceid}>
                                        {source.SourceName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddItemSubmit} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>





            {/* Edit Item Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Make changes to the item details below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Item Name"
                        type="text"
                        fullWidth
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Item Author"
                        type="text"
                        fullWidth
                        value={itemAuthor}
                        onChange={(e) => setItemAuthor(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Item Quantity"
                        type="number"
                        fullWidth
                        value={itemQuantity}
                        onChange={handleQuantityChange}
                        error={!!quantityError}
                        helperText={quantityError}
                    />
                    <TextField
                        margin="dense"
                        label="Item Price"
                        type="number"
                        fullWidth
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditItemSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete {itemName}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this item?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteItemSubmit} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            </>
            )}</div>
        </div>       
    );
};

export default ItemManagement;
