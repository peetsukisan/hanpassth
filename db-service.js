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
    },

    // ==================== UTILITY ====================

    // Seed initial demo data (for testing)
    async seedDemoData() {
        try {
            // Check if already has data
            const promos = await this.getPromotions();
            if (promos.length > 0) {
                console.log('Data already exists, skipping seed');
                return;
            }

            // Demo promotions
            const demoPromotions = [
                {
                    title: 'โปรโมชั่นสุดพิเศษ',
                    subtitle: 'รับเครดิตคืนสูงสุด 20%',
                    badge: 'EVENT',
                    badgeStyle: 'default',
                    backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    cardType: 'credit-card',
                    description: 'สมัครบัตรวันนี้รับเครดิตคืนสูงสุด 20% สำหรับลูกค้าใหม่',
                    sections: [
                        {
                            title: 'เงื่อนไขโปรโมชั่น',
                            content: 'สำหรับลูกค้าใหม่ที่สมัครบัตรเครดิตตั้งแต่วันที่ 1 ธ.ค. - 31 ธ.ค. 2024'
                        }
                    ],
                    startDate: '2024-12-01',
                    endDate: '2024-12-31',
                    isActive: true,
                    order: 1
                },
                {
                    title: 'แนะนำเพื่อนมาใช้บริการ',
                    subtitle: 'รับโบนัสสูงสุด 25,000 บาท',
                    badge: 'EVENT',
                    badgeStyle: 'default',
                    backgroundColor: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                    textColor: 'dark',
                    cardType: 'bonus',
                    description: 'แนะนำเพื่อนมาสมัครบัตร รับโบนัสทั้งคุณและเพื่อน',
                    sections: [],
                    isActive: true,
                    order: 2
                },
                {
                    title: 'สะสมแต้มแลกของรางวัล',
                    subtitle: 'สิทธิพิเศษใกล้ตัวคุณ',
                    badge: 'สิทธิพิเศษ',
                    badgeStyle: 'light',
                    backgroundColor: 'linear-gradient(135deg, #4a1c1c 0%, #8b0000 100%)',
                    cardType: 'lifestyle',
                    description: 'สะสมแต้มจากการใช้จ่ายแลกเป็นของรางวัลมากมาย',
                    sections: [],
                    isActive: true,
                    order: 3
                }
            ];

            // Demo guides
            const demoGuides = [
                {
                    title: 'สมัครสมาชิก',
                    description: 'ลงทะเบียนด้วยอีเมลหรือเบอร์โทรศัพท์',
                    icon: 'user-plus',
                    order: 1,
                    steps: [
                        { title: 'ขั้นตอนที่ 1', content: 'กรอกข้อมูลส่วนตัว' },
                        { title: 'ขั้นตอนที่ 2', content: 'ยืนยัน OTP' }
                    ],
                    isActive: true
                },
                {
                    title: 'ผูกบัตร',
                    description: 'เพิ่มบัตรเครดิตหรือบัตรเดบิต',
                    icon: 'credit-card',
                    order: 2,
                    steps: [],
                    isActive: true
                },
                {
                    title: 'เลือกโปรโมชั่น',
                    description: 'เลือกข้อเสนอที่คุณสนใจ',
                    icon: 'star',
                    order: 3,
                    steps: [],
                    isActive: true
                },
                {
                    title: 'รับสิทธิ์',
                    description: 'ใช้จ่ายและรับสิทธิประโยชน์ทันที',
                    icon: 'check',
                    order: 4,
                    steps: [],
                    isActive: true
                }
            ];

            // Add demo data
            for (const promo of demoPromotions) {
                await this.addPromotion(promo);
            }
            for (const guide of demoGuides) {
                await this.addGuide(guide);
            }

            console.log('Demo data seeded successfully');
        } catch (error) {
            console.error('Error seeding demo data:', error);
        }
    }
};

// Export for use in other scripts
window.dbService = dbService;
