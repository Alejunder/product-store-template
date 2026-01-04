import express from 'express';
import { getAllProducts, getProducts, createProduct, deleteProduct, updateProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProducts);
router.post('/', createProduct );
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);


export default router;