// src/component-page/Admin/AdminCatalog.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../scss/admin.scss";

function AdminCatalog() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    category: "",
    price: "",
    image_url: "",
    alt_text: ""
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost/api.php/catalog");
      // Ensure data is an array. If it's not, default to an empty array.
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error.response?.data || error.message);
      setItems([]); // fallback to empty array on error
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CREATE new item
  const handleCreate = async () => {
    try {
      await axios.post("http://localhost/api.php/catalog", {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        alt_text: formData.alt_text
      });
      fetchItems();
      setFormData({ id: null, name: "", category: "", price: "", image_url: "", alt_text: "" });
    } catch (error) {
      console.error("Failed to create item:", error.response?.data || error.message);
    }
  };

  // UPDATE item
  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost/api.php/catalog", {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        alt_text: formData.alt_text
      });
      fetchItems();
      setFormData({ id: null, name: "", category: "", price: "", image_url: "", alt_text: "" });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update item:", error.response?.data || error.message);
    }
  };

  // DELETE item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete("http://localhost/api.php/catalog", { data: { id } });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete item:", error.response?.data || error.message);
    }
  };

  // Begin editing
  const handleEditClick = (item) => {
    setEditing(true);
    setFormData(item); // item includes alt_text from DB
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    setFormData({ id: null, name: "", category: "", price: "", image_url: "", alt_text: "" });
  };

  return (
    <div className="admin-catalog">
      <h2 className="admin-catalog-title">Catalog Management</h2>

      {/* FORM */}
      <div className="catalog-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          type="text"
          name="alt_text"
          placeholder="Alt Text"
          value={formData.alt_text}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />

        {editing ? (
          <>
            <button onClick={handleUpdate} className="edit-button">
              Update
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Create</button>
        )}
      </div>

      {/* TABLE */}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {/* Add more table headers if needed */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((itm) => (
            <tr key={itm.id}>
              <td>{itm.id}</td>
              <td>{itm.name}</td>
              {/* Add more table cells if needed */}
              <td>
                <button className="edit-button" onClick={() => handleEditClick(itm)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(itm.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCatalog;
