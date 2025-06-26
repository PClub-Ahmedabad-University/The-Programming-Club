document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    // lucide.createIcons();
    
    // Get all tab items and content sections
    const tabItems = document.querySelectorAll('.ps-item');
    const contentSections = document.querySelectorAll('.ps-content');
    
    // Add click event listeners to tab items
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and content
            tabItems.forEach(tab => tab.classList.remove('active'));
            contentSections.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.ps-item.active');
        const currentIndex = Array.from(tabItems).indexOf(activeTab);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            tabItems[currentIndex - 1].click();
        } else if (e.key === 'ArrowRight' && currentIndex < tabItems.length - 1) {
            e.preventDefault();
            tabItems[currentIndex + 1].click();
        }
    });
});