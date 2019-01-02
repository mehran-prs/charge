(function () {
    // Initialize ElasticTabs:
    $('.elastic-tabs').each(function () {
        let $container = $(this);

        var $tabs = $container.find('.tabs');
        var $contents = $container.find('.tabs-content');

        var items = $tabs.find('a').length;
        var selector = $tabs.find(".selector");
        var activeItem = $tabs.find('.active');
        var activeWidth = activeItem.innerWidth();

        $container.find(".selector").css({
            "left": activeItem.position.left + "px",
            "width": activeWidth + "px"
        });

        $tabs.on("click", "a", function () {
            $tabs.find('a').removeClass("active");
            $(this).addClass('active');

            var activeWidth = $(this).innerWidth();
            var itemPos = $(this).position();
            $container.find(".selector").css({
                "left": itemPos.left + "px",
                "width": activeWidth + "px"
            });

            let id = $(this).attr('href');
            $contents.find('.tb-content').removeClass('active');
            $contents.find(`${id}`).addClass('active');

        });

        // Set current tap:
        $tabs.find('a.tab.active').trigger('click');
    });

})();