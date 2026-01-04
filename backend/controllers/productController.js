import {sql} from '../config/db.js';
export const getAllProducts = async (req, res) => {
    try{
        const products = await sql`
        SELECT * FROM products
        ORDER BY created_at DESC
        `;

        console.log("fetchProducts", products);
        res.status(200).json({success: true, data: products});
    } catch (error){ 
        console.log("error getProducts function", error);
        res.status(500).json({success: false, message: "internal server error"});
    };
};
export const createProduct = async (req, res) => {
    const {name, image, price} = req.body;
    if(!name || !price || !image){
        return res.status(400).json({success: false, message: "All fields are required"});
    }

    try{
        const newProduct = await sql`
        INSERT INTO products (name, image, price)
        VALUES (${name}, ${image}, ${price})
        RETURNING *
        `;
        // POSTMAN free
        console.log("newProduct added", newProduct);

        res.status(201).json({success: true, data: newProduct[0]});
    } catch (error){
        console.log("error in createProduct function", error);
        res.status(500).json({success: false, message: "internal server error"});
    }
};

export const getProducts = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await sql`
        SELECT * FROM products WHERE id = ${id}
        `;
        
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        console.log("fetchProduct", product[0]);
        res.status(200).json({ success: true, data: product[0] });
    } catch (error) {
        console.log("error in getProduct function", error);
        res.status(500).json({ success: false, message: "internal server error" });
    }
};
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, image, price } = req.body;

    try {
        const updateProduct = await sql`
        UPDATE products
        SET name = ${name}, image = ${image}, price = ${price}
        WHERE id = ${id}
        RETURNING *
        `;
       
        if (updateProduct.length === 0) {
            return res.status(404).json({
                 success: false,
                 message: "Product not found" 
            });
        }
        res.status(200).json({ success: true, data: updateProduct[0] });
    } catch (error) {
        console.log("error in updateProduct function", error);
        res.status(500).json({ success: false, message: "internal server error" });
    }
};
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await sql`
        DELETE FROM products WHERE id = ${id}
        RETURNING *
        `;  
        if (deletedProduct.length === 0) {
            return res.status(404).json({
                 success: false,
                 message: "Product not found" 
            });
        }
        res.status(200).json({ success: true, data: deletedProduct[0] });
    } catch (error) {
        console.log("error in deleteProduct function", error);
        res.status(500).json({ success: false, message: "internal server error" });
    }
};
