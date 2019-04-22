<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WPAdmin
 * This is the original get sidebar, which I mostly don't want
 * if ( ! is_active_sidebar( 'sidebar-1' ) ) {
 * return;
 * }
 * ?>
 * <aside id="secondary" class="widget-area">
 * <?php dynamic_sidebar( 'sidebar-1' ); ?>
 * </aside><!-- #secondary -->
 */
?>

<!--        Side Bar Navigation-->
<div class="col-md-3 left_col">
    <div class="left_col scroll-view">
        <div class="navbar nav_title" style="border: 0;">
            <a href="<?php echo get_site_url() ?>" class="site_title"><i class="fa fa-book"></i>
                <span>ChemGen</span></a>
        </div>

        <div class="clearfix"></div>

        <!-- menu profile quick info -->
        <div class="profile clearfix">
            <?php
            if (is_user_logged_in()) {
                $current_user = wp_get_current_user();
                ?>
                <div class="profile_info">
                    <h2>Welcome, <?php echo($current_user->user_login) ?></h2>
                </div>
                <?php
            } else {
                ?>
                <div class="profile_info">
                    <h2>Log in!</h2>
                    <a href="<?php echo get_site_url(); ?>/wp-login.php">Login</a>
                </div>
                <?php
            }
            ?>
            <div class="clearfix"></div>
        </div>
        <!-- /menu profile quick info -->

        <br/>

        <!-- sidebar menu -->
        <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
            <div class="menu_section">
                <!--Begin Score Menu-->
                <ul class="nav side-menu">
                    <li><a><i class="fa fa-search-minus"></i> Score <span
                                    class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li>
                                <a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/search-form-exp-workflow-qc">
                                    QC A Batch</a>
                            </li>
                            <li>
                                <a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/search-form-contact-sheet-plate">
                                    Contact Sheet - Plate View</a>
                            </li>
                            <li>
                                <a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/search-form-contact-sheet-replicate">
                                    Contact Sheet - Replicate View</a>
                            </li>
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/score-expsets-worms">Detailed Score - Replicates</a></li>
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/scored-summary">Scored Summary</a></li>
                        </ul>
                    </li>
                </ul>
                <!--Begin Score Menu-->

                <!--Begin Search Menu-->
                <ul class="nav side-menu">
                    <li><a><i class="fa fa-search"></i> Search <span
                                    class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/search-expsets-worms">Search
                                    for Exp Sets</a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <!--End Search Menu-->

                <!--Begin Upload Menu-->
                <ul class="nav side-menu">
                    <li><a><i class="fa fa-search"></i> Upload A Batch <span
                                    class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/app/#/rnai-primary">RNAi Primary</a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <!--End Upload Menu-->

                <!--Begin Help Menu-->
                <ul class="nav side-menu">
                    <li><a><i class="fa fa-question-circle"></i> Help  <span
                                    class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li>
                                <a href="<?php echo(get_bloginfo('wpurl')) ?>/eegi-wiki-page/using-scoring-forms/">
                                    Scoring Forms</a>
                            </li>
                            <li>
                                <a href="<?php echo(get_bloginfo('wpurl')) ?>/eegi-wiki-page/checking-data-with-phpmyadmin/">
                                    Querying the database with phpmyadmin</a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <!--Begin Score Menu-->

            </div>
        </div>
        <!-- /sidebar menu -->


        <!-- /menu footer buttons -->
        <div class="sidebar-footer hidden-small">
            <a data-toggle="tooltip" data-placement="top" title="Settings">
                <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="FullScreen">
                <span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="Lock">
                <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="Logout" href="login.html">
                <span class="glyphicon glyphicon-off" aria-hidden="true"></span>
            </a>
        </div>
        <!-- /menu footer buttons -->
    </div>
</div>
<!--        /Side Bar Navigation-->

<!-- top navigation -->
<div class="top_nav">
    <div class="nav_menu">
        <nav>
            <div class="nav toggle">
                <a id="menu_toggle"><i class="fa fa-bars"></i></a>
            </div>

            <ul class="nav navbar-nav navbar-right">
                <li></li>
            </ul>
        </nav>
    </div>
</div>
<!-- /top navigation -->
