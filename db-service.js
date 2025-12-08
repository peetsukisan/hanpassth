// Database Service - CRUD Operations for Promotions and Guides

const dbService = {
    // ==================== PROMOTIONS ====================

    // Get all promotions
    async getPromotions(activeOnly = false) {
        try {
            // Query without orderBy to avoid needing composite index
            const snapshot = await db.collection('promotions').get();
            let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter active only in JavaScript
            if (activeOnly) {
                results = results.filter(item => item.isActive === true);
            }
            
            // Sort by createdAt or order
            results.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            
            return results;
        } catch (error) {
            console.error('Error getting promotions:', error);
            return [];
        }
    },

    // Get single promotion by ID
    async getPromotion(id) {
        try {
            const doc = await db.collection('promotions').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting promotion:', error);
            return null;
        }
    },

    // Add new promotion
    async addPromotion(data) {
        try {
            const promotionData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: data.isActive !== undefined ? data.isActive : true
            };
            const docRef = await db.collection('promotions').add(promotionData);
            return { id: docRef.id, ...promotionData };
        } catch (error) {
            console.error('Error adding promotion:', error);
            throw error;
        }
    },

    // Update promotion
    async updatePromotion(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('promotions').doc(id).update(updateData);
            return { id, ...updateData };
        } catch (error) {
            console.error('Error updating promotion:', error);
            throw error;
        }
    },

    // Delete promotion
    async deletePromotion(id) {
        try {
            await db.collection('promotions').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    },

    // ==================== GUIDES ====================

    // Get all guides
    async getGuides(activeOnly = false) {
        try {
            // Query without orderBy to avoid needing composite index
            const snapshot = await db.collection('guides').get();
            let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter active only in JavaScript
            if (activeOnly) {
                results = results.filter(item => item.isActive === true);
            }
            
            // Sort by order field
            results.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            return results;
        } catch (error) {
            console.error('Error getting guides:', error);
            return [];
        }
    },

    // Get single guide by ID
    async getGuide(id) {
        try {
            const doc = await db.collection('guides').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting guide:', error);
            return null;
        }
    },

    // Add new guide
    async addGuide(data) {
        try {
            const guideData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: data.isActive !== undefined ? data.isActive : true
            };
            const docRef = await db.collection('guides').add(guideData);
            return { id: docRef.id, ...guideData };
        } catch (error) {
            console.error('Error adding guide:', error);
            throw error;
        }
    },

    // Update guide
    async updateGuide(id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('guides').doc(id).update(updateData);
            return { id, ...updateData };
        } catch (error) {
            console.error('Error updating guide:', error);
            throw error;
        }
    },

    // Delete guide
    async deleteGuide(id) {
        try {
            await db.collection('guides').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting guide:', error);
            throw error;
        }
    }
};

// Export for use in other scripts
window.dbService = dbService;
