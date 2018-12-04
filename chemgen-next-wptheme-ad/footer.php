<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WPAdmin
 */

?>

</div><!-- #content -->

<!-- footer content -->
<footer>
    <div class="pull-right">
        Gentelella - Bootstrap Admin Template by <a href="https://colorlib.com">Colorlib</a>
    </div>
    <div class="clearfix">

    </div>
    <div class="site-info">
        <a href="<?php echo esc_url(__('https://wordpress.org/', 'wpadmin')); ?>">
            <?php
            /* translators: %s: CMS name, i.e. WordPress. */
            printf(esc_html__('Proudly powered by %s', 'wpadmin'), 'WordPress');
            ?>
        </a>
        <span class="sep"> | </span>
        <?php
        /* translators: 1: Theme name, 2: Theme author. */
        printf(esc_html__('Theme: %1$s by %2$s.', 'wpadmin'), 'wpadmin', '<a href="http://github.com/jerowe">Jillian Rowe</a>');
        ?>
    </div><!-- .site-info -->
</footer>
<!-- /footer content -->
</div><!-- #page -->

<?php wp_footer(); ?>

<script src="<?php echo(bloginfo('template_directory')) ?>/node_modules/gentelella/vendors/jquery/dist/jquery.min.js"></script>
<script src="<?php echo(bloginfo('template_directory')) ?>/node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js"
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/runtime.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/polyfills.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/scripts.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/main.js"></script>

</body>
</html>
