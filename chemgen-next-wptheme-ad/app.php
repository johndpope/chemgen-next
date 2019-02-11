<?php /* Template Name: ChemGenAngularApp */ ?>
<?php
get_header();
$current_user = wp_get_current_user();
if (is_user_logged_in()) {
    $user_login = $current_user->user_login;
    $user_id = $current_user->id;
} else {
    $user_login = 0;
    $user_id = 0;
}
?>


<div id="primary" class="main_container">
    <?php get_sidebar(''); ?>

    <div role="main" id="main" class="right_col">

        <?php
        if (is_user_logged_in()) {
            ?>
            <div style="display:none">
                <div id="userName"  style="display: none;">
                    <?php echo($current_user->user_login) ?>
                </div>
                <div id="userId" style="display: none;">
                    <?php echo($current_user->ID) ?>
                </div>
            </div>
            <app-root></app-root>
            <?php
        } else {
            ?>
            <h2>Please login!</h2>
            <p>This page is not available unless you login</p>
            <a href="<?php echo get_site_url(); ?>/wp-login.php">Login</a>
            <?php
        }
        ?>

    </div><!-- #main -->
</div><!-- #primary -->

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
        ChemGen
    </div>
    <div class="clearfix">

    </div>
    <div class="site-info">
        <a href="<?php echo esc_url(get_site_url()); ?>">
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
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/runtime.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/polyfills.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/scripts.js"></script>
<script type="text/javascript" src="<?php echo(bloginfo('template_directory')) ?>/js/ng/main.js"></script>

</body>
</html>
